/**
 * SessionController
 *
 * @description :: Server-side logic for managing Sessions
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    register: function(req, res) {
        // check if the token already exists in the database
        Session.findOne({ firebaseToken: req.param('token') })
        .exec((error, session) => {
            if (error) return res.negotiate(error);

            // if a session already exists for this firebase token, update the session
            if (session) {
                // update the last action
                session.lastAction = Date.now();
                session.save(error => {
                    return res.ok({message: "existe déjà, updated"});
                });
            } else {
                // else, create a new session for this user
                const newSession = {
                    user: req.user,
                    androidId: "temp",
                    firebaseToken: req.param('token'),
                    socketId: sails.sockets.getId(req)
                };
                Session.create(newSession).exec((error, session) => {
                    if (error) return res.negotiate(error);

                    return res.ok({message: "nouvelle session"});
                });
            }
        });
    }

};
