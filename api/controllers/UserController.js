/**
 * MessageController
 *
 * @description :: Server-side logic for managing Messages
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    /**
     * `UserController.index()`
     */
    index: function (req, res) {
        let where = false;
        if(Team.can(req, 'chat/talk')) {
            where = {or:[]};
            // Simple chat access
            where.or.push({
                or: [
                    {'recipient': req.team.id},
                    {'sender': req.team.id},
                    {'group': req.team.group},
                ],
                'private': false,
            });

            if(Team.can(req, 'chat/talk-to-groups')) {
                where.or.push({
                    'group': {'!=': null},
                    'private': false,
                });
            }

            if(Team.can(req, 'chat/talk-to-teams')) {
                where.or.push({
                    'group': null,
                    'private': false,
                });
            }
            if(Team.can(req, 'chat/talk-to-myself')) {
                where.or.push({
                    'recipient': req.team.id,
                    'sender': req.team.id,
                    'private': true,
                });
            }
        }

        Message.find(where).exec((error, message) => {
            if (error) {
                return res.negotiate(error);
            }
            return res.ok(message);
        })

        // TODO update Message.publishCreate implementation to filter who gets what
        // and remove the next line
    },

    /**
     * `UserController.createTest()`
     *  First API method for the simple chat, an example of pubsub with front-end
     */
    createTest: function (req, res) {
        console.log(req.user)
        console.log(req.team)
        console.log(req.team.id)
        Message.create({text: req.param('text'), sender: req.team.id}).exec(function (err, message){
            if (err) { return res.serverError(err); }
            sails.log('message created', message);
            Message.publishCreate(message);
            return res.ok(message);
        });
    },
};
