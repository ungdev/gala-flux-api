/**
 * AlertHistory.js
 *
 * @description :: An AlertHistory is created each time an Alert is created or updated. This is a copy of this alert.
 * The goal of this model is to log all about the alerts.
 *
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {

        /**
         * Can be null if alerte deleted
         */
        alertId: {
            model: "alert",
            required: true
        },

        /**
         * Can be null if team deleted
         */
        sender: {
            model: "team"
        },

        /**
         * Can be null if team deleted
         */
        receiver: {
            model: "team"
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

    },

    pushToHistory(alert, callback) {

        AlertHistory.create({
            alertId: alert.id,
            sender: alert.sender,
            receiver: alert.receiver,
            severity: alert.severity,
            title: alert.title,
            category: alert.category,
            message: alert.message,
            button: alert.button,
        }).exec((error, alertHistory) => {
            callback(error, alertHistory);
        });

    }

};
