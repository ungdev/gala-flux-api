const Base = require('./Base');

function Model () {

    this.attributes = {

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

    };

    this.pushToHistory = function(alert, callback) {

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

    };

    /**
     * Before removing an item from the database
     *
     * @param {object} criteria contains the query with the user id
     * @param {function} cb the callback
     */
    this.beforeDestroy = function(criteria, cb) {
        let error = new Error("It's forbidden to destroy an item of this model.");
        sails.log.error(error);
        return cb(error);
    };
}

// Inherit Base Model
Model.prototype = new Base('AlertHistory');

// Construct and export
module.exports = new Model();
