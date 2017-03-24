/**
 * MessageController
 *
 * @description Get and create messages according to your permissions
 */

 /**
  * @apiDefine badRequestError
  * @apiError BadRequest Parameters are not valid for this api endpoint
  * @apiErrorExample BadRequest
  *     HTTP/1.1 400 Bad Request
  *     {
  *         "_error": {
  *             code: 400,
  *             status: 'BadRequest',
  *             message: 'Parameters are not valid for this api endpoint'
  *         }
  *     }
  *
  */
  /**
   * @apiDefine forbiddenError
   * @apiError forbidden You are not authorized to to that
   * @apiErrorExample forbidden
   *     HTTP/1.1 403 Forbidden
   *     {
   *         "_error": {
   *             code: 403,
   *             status: 'forbidden',
   *             message: 'You are not authorized to to that'
   *         }
   *     }
   *
   */

module.exports = {

    /**
     * @api {get} /message/find Get all messages
     * @apiName find
     * @apiGroup Message
     * @apiDescription Get the list of all messages according to permissions.
     * @apiSuccess {Array} list An array of message
     * @apiSuccess {String} list.text Message content
     * @apiSuccess {User} list.senderUser Sender User object
     * @apiSuccess {Team} list.senderTeam Sender Team object
     * @apiSuccess {Team} list.channel Target channel name without the #
     * * `public:[teamname]` : For subject concerning the team. [teamname] will be converted alphanumeric only
     * * `private:[teamname]` : For internal private messages inside the team
     * * `group:[groupname]` : For group discutions according to the `group` field in team
     */
    find: function (req, res) {
        let where = false;

        // Receive #group:[groupname] and #[teamname] but can send only in #[teamname]
        if(Team.can(req, 'message/oneChannel')) {
            where = {
                or: [
                    {'channel': 'public:'+Message.toChannel(req.team.name)},
                    {'channel': 'group:'+Message.toChannel(req.team.group)},
                ]
            };
            sails.sockets.join(req, 'message/' + ('public:'+Message.toChannel(req.team.name)));
            sails.sockets.join(req, 'message/' + ('group:'+Message.toChannel(req.team.group)));
        }

        // Send/read message to/from everywhere also private channels
        else if(Team.can(req, 'message/admin')) {
            where = {};
            Message.watch(req);
        }

        // Not compatible with `oneChannel`. Can send and receive in any
        // public #[teamname] channel, can also receive and send in
        // its own #group:[groupname] channel
        else if(Team.can(req, 'message/public')) {
            where = {
                or: [
                    {'channel': {'like': 'public:%'}},
                    {'channel': 'group:'+Message.toChannel(req.team.group)},
                ]
            };
            sails.sockets.join(req, 'message/' + 'public:*');
            sails.sockets.join(req, 'message/' + ('group:'+Message.toChannel(req.team.group)));

            // Can send and receive in any #group:[groupname] channel
            if(Team.can(req, 'message/group')) {
                where.or.push({'channel': {'like': 'group:%'}})

                // Leave single group room, to avoid duplicate messages
                sails.sockets.leave(req, 'message/' + ('group:'+Message.toChannel(req.team.group)));
                sails.sockets.join(req, 'message/' + 'group:*');
            }

            // Can send and receive in its own #private:[teamname] channel
            if(Team.can(req, 'message/private')) {
                where.or.push({'channel': 'private:'+Message.toChannel(req.team.name)})

                sails.sockets.leave(req, 'message/' + ('private:'+Message.toChannel(req.team.name)));
            }
        }

        Message.find(where)
        .populate('senderUser')
        .populate('senderTeam')
        .exec((error, messages) => {
            if (error) {
                return res.negotiate(error);
            }

            // Return message list
            return res.ok(messages);
        })
    },


    /**
     * @api {post} /message/create Send a message
     * @apiName create
     * @apiGroup Message
     * @apiDescription Send a message
     *
     * @apiParam {string} text The message content (required)
     * @apiParam {string} channel  Target channel name without the # (Optional)
     *
     * @apiSuccess {Message} message The message that you've juste created
     *
     * @apiUse badRequestError
     * @apiUse forbiddenError
     */
    create: function (req, res) {
        // Default values
        let channel = req.param('channel');
        if(!channel) {
            channel = 'public:'+Message.toChannel(req.team.name);
        }

        // Check permissions
        // Receive #group:[groupname] and #[teamname] but can send only in #[teamname]
        if(Team.can(req, 'message/oneChannel')
            && channel != 'public:'+Message.toChannel(req.team.name)) {

            return res.error(403, 'forbidden', 'You cannot send message in another channel than ' + 'public:'+Message.toChannel(req.team.name));
        }

        // Not compatible with `oneChannel`. Can send and receive in any
        // public #[teamname] channel, can also receive and send in
        // its own #group:[groupname] channel
        else if(Team.can(req, 'message/public')) {
            let authorized = [
                '/^public\:.+$/g',
                '/^group\:' + Message.toChannel(req.team.group) + '$/g',
            ];

            if(Team.can(req, 'message/group')) {
                authorized.push('/^group\:.+$/g')
            }
            if(Team.can(req, 'message/private')) {
                authorized.push('/^private\:' + Message.toChannel(req.team.name) + '$/g')
            }

            var match = _.some(authorized, (regex) => {
                return (new RegExp(regex)).test(channel);
            })
            if(!match) {
                return res.error(403, 'forbidden', 'You are not authorized to send in this channel');
            }
        }
        // No permission
        else if(!Team.can(req, 'message/admin')) {
            return res.error(403, 'forbidden', 'You are not authorized to send any messages');
        }

        // Check parameters
        if(!req.param('text')) {
            return res.error(400, 'BadRequest', 'The parameter `text` is empty.');
        }
        else if (req.param('recipientTeam') && req.param('recipientGroup')) {
            return res.error(400, 'BadRequest', 'You cannot use `recipientTeam` and `recipientGroup` at the same time');
        }

        // Create message
        Message.create({
            senderUser: req.user,
            senderTeam: req.team,
            text: req.param('text'),
            channel: channel,
        }).exec((error, message) => {
            if (error) {
                return res.negotiate(error);
            }

            // Let's publish to clients
            let data = {
                verb: 'created',
                id: message.id,
                data: message,
            };

            // Publish
            sails.sockets.broadcast(channel, 'message', data);

            let prefix = channel.substr(0, channel.indexOf(':'));
            sails.sockets.broadcast(prefix + ':*', 'message', data);

            Message.publishCreate(message);

            return res.ok(message);
        });

    },


    /**
     * @api {get} /message/channels Get channels
     * @apiName getChannels
     * @apiGroup Message
     * @apiDescription Get the list of channels according to read permissions
     * @apiSuccess {Array} list An array of channel name (without #)
     */
    getChannels: function (req, res) {
        let list = [];

        // Receive #group:[groupname] and #[teamname] but can send only in #[teamname]
        if(Team.can(req, 'message/oneChannel')) {
            list.push('public:'+Message.toChannel(req.team.name));
            list.push('group:'+Message.toChannel(req.team.group));
            return res.ok(list);
        }
        else if(Team.can(req, 'message/admin') || Team.can(req, 'message/public')) {
            Team.find().exec((error, teams) => {
                // Public
                for (team of teams) {
                    list.push('public:'+Message.toChannel(team.name));
                }

                // Group
                if(Team.can(req, 'message/group') || Team.can(req, 'message/admin')) {
                    for (team of teams) {
                        list.push('group:'+Message.toChannel(team.group));
                    }
                }
                else {
                    list.push('group:'+Message.toChannel(req.team.group));
                }

                // Private
                if(Team.can(req, 'message/private')) {
                    list.push('private:'+Message.toChannel(req.team.name));
                }
                else if(Team.can(req, 'message/admin')){
                    for (team of teams) {
                        list.push('private:'+Message.toChannel(team.name));
                    }
                }

                return res.ok(list);
            })
        }

        return res.error(403, 'forbidden', 'You are not authorized to read any channel');
    },
};
