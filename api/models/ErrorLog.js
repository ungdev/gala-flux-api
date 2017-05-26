const Sequelize = require('sequelize');
const Flux = require('../../Flux');
const inheritBaseModel = require('../../lib/BaseModel');

const ErrorLog = Flux.sequelize.define('errorLog', {

    ip: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            isIP: true,
            notEmpty: true,
        },
    },

    message: {
        type: Sequelize.TEXT,
    },

    error: {
        type: Sequelize.TEXT,
        get: function () {
            return JSON.parse(this.getDataValue('error'));
        },
        set: function (value) {
            this.setDataValue('error', JSON.stringify(value));
        },
    },

    details: {
        type: Sequelize.TEXT,
        get: function () {
            return JSON.parse(this.getDataValue('details'));
        },
        set: function (value) {
            this.setDataValue('details', JSON.stringify(value));
        },
    },

    stack: {
        type: Sequelize.TEXT,
    },

    notificationStack: {
        type: Sequelize.TEXT,
    },

});
const Model = ErrorLog;
Model.buildReferences = () => {
    // This function will be called once all models are initialized by Flux Object.
    Model.belongsTo(Flux.User, {
        hooks: true,
    });
};
inheritBaseModel(ErrorLog);


module.exports = Model;
