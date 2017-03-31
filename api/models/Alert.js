/**
 * Alert.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {

        sender: {
            model: "team",
            required: true
        },

        receiver: {
            model: "team",
            required: true
        },

        severity: {
            type: "string",
            required: true
        },

        title: {
            type: "string",
            required: true
        },

        category: {
            type: "string",
            required: true
        },

        message: {
            type: "text"
        },

        button: {
            model: "alertbutton"
        }

    }

};

