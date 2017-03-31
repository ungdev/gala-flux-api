/**
 * AlertButton.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {

        receiver: {
            model: "team",
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

        // true if a message is required
        message: {
            type: "boolean",
            required: true
        },

        messagePlaceholder: {
            type: "string"
        }

    }

};

