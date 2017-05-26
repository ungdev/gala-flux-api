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

    disconnectedAt: {
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
 * Configure attributes
 **********************************************/

// Update will be emitted to client only if another attribute has been updated
Model.ignoredAttrUpdate = ['updatedAt', 'lastAction', 'firebaseToken', 'deviceId', 'socketId'];

// Attribute hidden on when sending to client
Model.hiddenAttr = ['firebaseToken', 'deviceId', 'socketId'];

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
