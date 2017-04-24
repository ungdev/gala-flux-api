/**
 * Alert.js
 *
 * @description :: An alert is a problem to solve. An alert can be created from an AlertButton
 * by a user, or automatically.
 *
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 *
 */

module.exports = {

    attributes: {

        // the team which sent the alert
        sender: {
            model: "team",
            required: true
        },

        // the team targeted by the alert. (who can see it)
        receiver: {
            model: "team",
            defaultsTo: null
        },

        // alert degree :
        // warning      => 1st level
        // serious      => 2nd level
        // done         => closed alert
        severity: {
            type: "string",
            required: true,
            enum: ['done', 'warning', 'serious']
        },

        title: {
            type: "string",
            required: true
        },

        category: {
            type: "string",
            required: true
        },

        // if the user wrote a message when he created the alert
        message: {
            type: "text"
        },

        // If the alert was created from an AlertButton
        button: {
            model: "alertbutton"
        },

        // If the button was deleted, his title will be saved in this attribute
        buttonTitle: {
            type: "string"
        },

        // users on this alert
        users: {
            collection: "user",
            via: "alerts",
            dominant: true
        }

    }

};

