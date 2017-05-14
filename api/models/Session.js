/**
 * Session.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {

        user: {
            model: "user",
            required: true
        },

        deviceId: {
            type: "string"
        },

        firebaseToken: {
            type: "string"
        },

        socketId: {
            type: "string"
        },

        // timestamp
        createdAt: {
            type: 'integer',
            defaultsTo: Date.now(),
            required: true
        },

        // timestamp
        lastAction: {
            type: 'integer',
            defaultsTo: Date.now(),
            required: true
        },

        // timestamp
        disconnectedAt: {
            type: 'integer',
            defaultsTo: Date.now(),
            required: true
        }

    },

    /**
     * When a socket is closed or a user clicked on the logout button, update the session
     * @param {string} socketId
     * @param {boolean} requested if the logout is requested by user, we can even delete android sessions
     * @return {boolean} update success
     */
    handleLogout: function(socketId, requested) {

        // get the session with this socket id
        Session.findOne({socketId}).exec((err, session) => {
            if (err) return err;

            // session already destroyed (disconnected and then close the browser tab for example)
            if (!session) return null;

            // if the session has a firebase token, update the disconnectedAt value
            if (session.firebaseToken && !requested) {
                session.disconnectedAt = Date.now();
                session.save(err => {
                    if (err) return err;

                    callCheckTeamActivity(session.user);
                    return null;
                });
            } else {
                // the device doesn't have a firebase token, so delete the session because this one will not be opened again
                Session.destroy({id: session.id}).exec(err => {
                    if (err) return err;

                    callCheckTeamActivity(session.user);
                    return null;
                });
            }
        });
    }

};

function callCheckTeamActivity(userId) {
    User.findOne({id: userId}).exec((err, user) => {
        if (!err && user) {
            AlertService.checkTeamActivity(user.team);
        }
    });
}
