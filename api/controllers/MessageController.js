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

class MessageController {


    /**
     * @api {post} /message/subscribe Subscribe to new messages
     * @apiName subscribe
     * @apiGroup Message
     * @apiDescription Subscribe to all new messages.
     */
    static subscribe(req, res) {
        // Receive #group:[groupname] and #[teamname] but can send only in #[teamname]
        if(Team.can(req, 'message/oneChannel')) {
            sails.sockets.join(req, 'message/' + ('public:'+Message.toChannel(req.team.name)), () => {
                sails.sockets.join(req, 'message/' + ('group:'+Message.toChannel(req.team.group)), () => {
                    return res.ok();
                });
            });
        }
        // Send/read message to/from everywhere also private channels
        else if(Team.can(req, 'message/admin')) {
            Message.watch(req);
            return res.ok();
        }
        // Not compatible with `oneChannel`. Can send and receive in any
        // public #[teamname] channel, can also receive and send in
        // its own #group:[groupname] channel
        else if(Team.can(req, 'message/public')) {
            let join = [];
            join.push('message/' + 'public:*');

            // Can send and receive in any #group:[groupname] channel
            if(Team.can(req, 'message/group')) {
                join.push('message/' + 'group:*');
            }
            // Can only send/receive in your own group
            else {
                join.push('message/' + ('group:'+Message.toChannel(req.team.group)));
            }

            // Can send and receive in its own #private:[teamname] channel
            if(Team.can(req, 'message/private')) {
                join.push('message/' + ('private:'+Message.toChannel(req.team.name)));
            }

            // Process joins
            async.each(join, (join, cb) => {
                sails.sockets.join(req, join, cb);
            }, (error) => {
                if (error) {
                    return res.negotiate(error);
                }
                return res.ok();
            });
        }

    }

    /**
     * @api {post} /message/unsubscribe Unsubscribe from new messages
     * @apiName subscribe
     * @apiGroup Message
     * @apiDescription Unsubscribe from new messages
     */
    static unsubscribe(req, res) {
        Message.unwatch(req);
        sails.sockets.leave(req, 'message/' + 'public:*', () => {
            sails.sockets.leave(req, 'message/' + 'group:*', () => {
                Team.find().exec((error, teams) => {
                    if (error) {
                        return res.negotiate(error);
                    }
                    async.each(teams, (team, cb) => {
                        async.series([
                            cb => sails.sockets.leave(req, 'message/' + ('group:'+Message.toChannel(team.group)), cb),
                            cb => sails.sockets.leave(req, 'message/' + ('private:'+Message.toChannel(team.name)), cb),
                            cb => sails.sockets.leave(req, 'message/' + ('public:'+Message.toChannel(team.name)), cb),
                        ], cb);
                    }, (error) => {
                        if (error) {
                            return res.negotiate(error);
                        }
                        return res.ok();
                    });
                });
            });
        });
    }

    /**
     * @api {get} /message/find Get all messages
     * @apiName find
     * @apiGroup Message
     * @apiDescription Get the list of all messages according to permissions.
     * @apiSuccess {Array} Array An array of message
     * @apiSuccess {Message} Array.mesage A message object
     * @apiSuccess {String} Array.mesage.text Message content
     * @apiSuccess {id} Array.mesage.sender Sender User id
     * @apiSuccess {Team} Array.mesage.channel Target channel name without the #
     * * `public:[teamname]` : For subject concerning the team. [teamname] will be converted alphanumeric only
     * * `private:[teamname]` : For internal private messages inside the team
     * * `group:[groupname]` : For group discutions according to the `group` field in team
     */
    static find(req, res) {
        let where = false;

        // Receive #group:[groupname] and #[teamname] but can send only in #[teamname]
        if(Team.can(req, 'message/oneChannel')) {
            where = {
                or: [
                    {'channel': 'public:'+Message.toChannel(req.team.name)},
                    {'channel': 'group:'+Message.toChannel(req.team.group)},
                ]
            };
        }

        // Send/read message to/from everywhere also private channels
        else if(Team.can(req, 'message/admin')) {
            where = {};
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

            // Can send and receive in any #group:[groupname] channel
            if(Team.can(req, 'message/group')) {
                where.or.push({'channel': {'like': 'group:%'}});
            }

            // Can send and receive in its own #private:[teamname] channel
            if(Team.can(req, 'message/private')) {
                where.or.push({'channel': 'private:'+Message.toChannel(req.team.name)});
            }
        }

        Message.find(where).sort('createdAt ASC')
        .exec((error, messages) => {
            if (error) {
                return res.negotiate(error);
            }

            // Return message list
            return res.ok(messages);
        });
    }


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
    static create(req, res) {
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
                '^public\:.+$',
                '^group\:' + Message.toChannel(req.team.group) + '$',
            ];

            if(Team.can(req, 'message/group')) {
                authorized.push('^group\:.+$');
            }
            if(Team.can(req, 'message/private')) {
                authorized.push('^private\:' + Message.toChannel(req.team.name) + '$');
            }

            var match = _.some(authorized, (regex) => {
                return (new RegExp(regex, 'g')).test(channel);
            });
            if(!match) {
                return res.error(403, 'forbidden', 'You are not authorized to send in this channel');
            }
        }
        // No permission
        else if(!Team.can(req, 'message/admin') && !Team.can(req, 'message/public') && !Team.can(req, 'message/oneChannel')) {
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
            sender: req.user,
            text: req.param('text'),
            channel: channel,
        }).exec((error, message) => {
            if (error) {
                return res.negotiate(error);
            }

            FirebaseService.notifyChatMessage(message, req.user, req.team);

            return res.ok(message);
        });

    }


    /**
     * @api {get} /message/channels Get channels
     * @apiName getChannels
     * @apiGroup Message
     * @apiDescription Get the list of channels according to read permissions
     * @apiSuccess {Array} list An array of channel name (without #)
     */
    static getChannels(req, res) {
        let list = new Set();

        // Receive #group:[groupname] and #[teamname] but can send only in #[teamname]
        if(Team.can(req, 'message/oneChannel')) {
            list.add('public:'+Message.toChannel(req.team.name));
            list.add('group:'+Message.toChannel(req.team.group));
            return res.ok([...list]);
        }
        else if(Team.can(req, 'message/admin') || Team.can(req, 'message/public')) {
            list.add('public:General');
            Team.find().exec((error, teams) => {
                // Public
                for (let team of teams) {
                    list.add('public:'+Message.toChannel(team.name));
                }

                // Group
                if(Team.can(req, 'message/group') || Team.can(req, 'message/admin')) {
                    for (let team of teams) {
                        list.add('group:'+Message.toChannel(team.group));
                    }
                }
                else {
                    list.add('group:'+Message.toChannel(req.team.group));
                }

                // Private
                if(Team.can(req, 'message/private')) {
                    list.add('private:'+Message.toChannel(req.team.name));
                }
                else if(Team.can(req, 'message/admin')){
                    for (let team of teams) {
                        if(Team.can(team, 'message/private') || Team.can(team, 'message/admin')) {
                            list.add('private:'+Message.toChannel(team.name));
                        }
                    }
                }

                let out = [...list];
                out.sort();
                return res.ok(out);
            })
        }
        else {
            return res.error(403, 'forbidden', 'You are not authorized to read any channel');
        }
    }
};

module.exports = MessageController;
