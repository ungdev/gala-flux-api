const Sequelize = require('sequelize');
const Flux = require('../../Flux');
const inheritBaseModel = require('../../lib/BaseModel');

const AlertButton = Flux.sequelize.define('alertButton', {

    title: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },

    /**
     * The category is only usefull to separate diffent type of alert
     * in the bar UI.
     */
    category: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },

    /**
     * The group that will see the button
     * If empty, every group will see it
     */
    senderGroup: {
        type: Sequelize.STRING,
    },

    /**
     * true if a message is required
     */
    messageRequired: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
    },

    /**
     * A prompt can be display to the user over the message field.
     * This prompt can be a question, for example.
     */
    messagePrompt: {
        type: Sequelize.STRING,
    },

    /**
     * A default message value can be set to help user answer the question
     */
    messageDefault: {
        type: Sequelize.STRING,
    },
});
const Model = AlertButton;
Model.buildReferences = () => {
    // This function will be called once all models are initialized by Flux Object.

    /**
     * the team targeted by the alert
     */
     Model.belongsTo(Flux.Team, {
         hooks: true,
         as: 'receiverTeam',
     });
};
inheritBaseModel(AlertButton);

module.exports = Model;
