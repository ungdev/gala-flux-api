const Sequelize = require('sequelize');
const Flux = require('../../Flux');
const inheritBaseModel = require('../../lib/BaseModel');

const AlertLog = Flux.sequelize.define('alertLog', {

    title: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },

    // alert degree :
    // warning      => 1st level
    // serious      => 2nd level
    // done         => closed alert
    severity: {
        type:   Sequelize.ENUM('done', 'warning', 'serious'),
        allowNull: false,
    },

    // if the user wrote a message when he created the alert
    message: {
        type: Sequelize.STRING,
    },

    // users on this alert
    users: {
        type: Sequelize.TEXT,
        get: function () {
            let value = this.getDataValue('users');
            if(!value) return [];
            return JSON.parse(value);
        },
        set: function (value) {
            this.setDataValue('users', JSON.stringify(value));
        },
    }

});
const Model = AlertLog;
Model.buildReferences = () => {
    // This function will be called once all models are initialized by Flux Object.
    Model.belongsTo(Flux.Team, {
        hooks: true,
        as: 'senderTeam',

    });
    Model.belongsTo(Flux.Team, {
        hooks: true,
        as: 'receiverTeam',
    });
    Model.belongsTo(Flux.AlertButton, {
        hooks: true,
        as: 'button',
    });
    Model.belongsTo(Flux.Alert, {
        hooks: true,
    });
};
inheritBaseModel(AlertLog);


module.exports = Model;
