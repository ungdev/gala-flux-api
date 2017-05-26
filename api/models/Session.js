const Sequelize = require('sequelize');
const Flux = require('../../Flux');
const inheritBaseModel = require('../../lib/BaseModel');

const Session = Flux.sequelize.define('session', {

    deviceId: {
        type: Sequelize.STRING,
        unique: true,
    },

    firebaseToken: {
        type: Sequelize.STRING,
        unique: true,
    },

    socketId: {
        type: Sequelize.STRING,
        unique: true,
    },

    ip: {
        type: Sequelize.STRING,
        validate: {
            isIP: true,
        },
    },

    lastAction: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false,
    },

    connectionLost: {
        type: Sequelize.DATE,
    },
});
const Model = Session;
Model.buildReferences = () => {
    // This function will be called once all models are initialized by Flux Object.
    Model.belongsTo(Flux.User, {
        foreignKey: { allowNull: false },
        hooks: true,
    });
};
inheritBaseModel(Session);


/**********************************************
 * Customize User groups
 *
 * No one can edit sessions via API
 **********************************************/
Model.getUserCreateGroups = function(team, user) {
    return [];
};
Model.getUserUpdateGroups = Model.getUserCreateGroups;
Model.getUserDestroyGroups = Model.getUserCreateGroups;



module.exports = Model;

/*
    // Attribute hidden on when sending to client
    hiddenAttr: ['firebaseToken', 'androidId', 'socketId'],

    // Update will be emitted to client only if another attribute has been updated
    ignoredAttrUpdate: ['firebaseToken', 'androidId', 'socketId', 'createdAt', 'user'],

    /**
     * When a socket is closed or a user clicked on the logout button, update the session
     * @param {string} socketId
     * @param {boolean} requested if the logout is requested by user, we can even delete android sessions
     * @return {boolean} update success
     *
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
*/
