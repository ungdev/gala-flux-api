/**
 * AlertButton.js
 *
 * @description :: An AlertButton enable some users to create an Alert. In the UI, an AlertButton will be a button.
 * When a user will click on that button, it will create a new Alert based on the AlertButton attributes's values.
 *
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {

        // the team targeted by the alert.
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

        // if a message is required, a placeholder can be display to the user.
        // this placeholder can be a question, for example.
        messagePlaceholder: {
            type: "string"
        }

    }

};

