/**
 * SessionController
 *
 * @description :: Server-side logic for managing Sessions
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    /**
     * @api {post} /session/subscribe Subscribe to new items
     * @apiName subscribe
     * @apiGroup Session
     * @apiDescription Subscribe to all new items.
     */
    subscribe: function(req, res) {
        if (Team.can(req, 'session/read')) {
            Session.watch(req);
            Session.find().exec((error, items) => {
                if (error) return res.negotiate(error);
                Session.subscribe(req, _.pluck(items, 'id'));
                return res.ok();
            });
        }
        else {
            return res.ok();
        }
    },

    /**
     * @api {post} /session/unsubscribe Unsubscribe from new items
     * @apiName subscribe
     * @apiGroup Session
     * @apiDescription Unsubscribe from new items
     */
    unsubscribe: function(req, res) {
        Session.unwatch(req);
        Session.find().exec((error, items) => {
            if (error) return res.negotiate(error);
            Session.unsubscribe(req, _.pluck(items, 'id'));
            return res.ok();
        });
    },

    find: function(req, res) {
        // Check permissions
        if (!(Team.can(req, 'session/read') )) {
            return res.error(403, 'forbidden', "You are not allowed to read the sessions");
        }

        Session.find().exec((error, sessions) => {
            if (error) return res.negotiate(error);
            return res.ok(sessions);
        });
    },

    open: function(req, res) {
        const newSession = {
            user: req.user,
            androidId: "temp",
            socketId: sails.sockets.getId(req)
        };

        // if there is no token, create a new session with the socket id
        if (!req.param('token') || req.param('token') === 'null') {
            Session.create(newSession).exec((error, session) => {
                if (error) return res.negotiate(error);

                return res.ok({message: "new session, no firebase token"});
            });
        } else {
            // check if the token already exists in the database
            Session.findOne({ firebaseToken: req.param('token') })
                .exec((error, session) => {
                    if (error) return res.negotiate(error);

                    // if a session already exists for this firebase token, update the session
                    if (session) {
                        // update the last action
                        session.lastAction = Date.now();
                        // set the socket id
                        session.socketId = req.socket.id;
                        session.save(err => {
                            if (err) return res.negotiate(err);

                            return res.ok({message: "session updated"});
                        });
                    } else {
                        // else, create a new session for this user
                        newSession.firebaseToken = req.param('token');

                        Session.create(newSession).exec((error, session) => {
                            if (error) return res.negotiate(error);

                            return res.ok({message: "new session"});
                        });
                    }
                });
        }
    }

};

