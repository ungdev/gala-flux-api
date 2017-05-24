const Base = require('./Base');

function Model () {

    this.attributes = {

        title: {
            type: 'string',
            required: true
        },

        /**
         * The category is only usefull to separate diffent type of alert
         * in the bar UI. It's not used in the admin ui.
         */
        category: {
            type: 'string',
            required: true
        },

        /**
         * The group that will see the button
         * If empty, every group will see it
         */
        senderGroup: {
            type: 'string',
        },

        /**
         * the team targeted by the alert
         */
        receiver: {
            model: 'team',
            required: true
        },

        /**
         * true if a message is required
         */
        messageRequired: {
            type: 'boolean',
            required: true
        },

        /**
         * A prompt can be display to the user over the message field.
         * This prompt can be a question, for example.
         */
        messagePrompt: {
            type: 'string'
        },

        /**
         * A default message value can be set to help user answer the question
         */
        messageDefault: {
            type: 'string'
        },

    };

    /**
     * Before removing a AlertButton from the database
     *
     * @param {object} criteria: contains the query with the AlertButton id
     * @param {function} cb: the callback
     */
    this.beforeDestroy = function(criteria, cb) {
        AlertButton.find(criteria).exec((error, alertButtons) => {
            if(error) return cb(error);
            // Execute set of rules for each deleted user
            async.each(alertButtons, (alertButton, cb) => {
                async.parallel([

                    // update the alert  where the button is this one
                    cb => Alert.update2({button: alertButton.id}, {button: null}).exec(cb),

                ], (error) => {
                    if(error) return cb(error);

                    // Publish destroy event
                    AlertButton._publishDestroy(alertButton.id);

                    return cb();
                });
            }, cb);
        });
    };


    /**
     * This method will be called by Base.js on update and create to add custom validations rules
     * @param {Object} newValue
     * @return {Object} Return an object with attr as key and array of error objects as value.
     * Thoses error objects have a at least the attribute `rule` whi
     */
    this.customValidation = function(newValue) {
        return 'olé';
    }


    this.fixtures = {
        generateLogAlertButtons: function(callback) {
            // get the teams
            Team.findOne({name: "Logistique"}).exec((error, team) => {
                if(error) {
                    callback(error);
                }

                let data = {
                    "Technique": [
                        {
                            title: "Problème avec une tireuse",
                            messageRequired: true,
                            messagePrompt: "Quel est le problème ?",
                            messageDefault: "La tireuse mousse : (Oui/Non)\nLa tireuse est chaude : (Oui/Non)\n",
                            senderGroup: null,
                            receiver: team.id,
                        },
                        {
                            title: "Problème avec un fût",
                            messageRequired: true,
                            messagePrompt: "Quel est le problème ?",
                            senderGroup: null,
                            receiver: team.id,
                        }
                    ],
                    "Manque": [
                        {
                            title: "Flutes de champagne",
                            messageRequired: false,
                            messagePrompt: "",
                            senderGroup: null,
                            receiver: team.id,
                        },
                        {
                            title: "Sacs poubelle",
                            messageRequired: false,
                            messagePrompt: "",
                            senderGroup: null,
                            receiver: team.id,
                        },
                        {
                            title: "Gobelets bière",
                            messageRequired: false,
                            messagePrompt: "",
                            senderGroup: null,
                            receiver: team.id,
                        }
                    ]
                };

                let result = {};

                // loop through the data array
                for (let category in data) {
                    // loop through each item of this category
                    let i = 0;
                    for (let item of data[category]) {
                        result[category + i] = Object.assign(item, {
                            category,
                        });
                        i++;
                    }
                }

                return callback(null, result);
            });
        }
    };

}

// Inherit Base Model
Model.prototype = new Base('AlertButton');

// Construct and export
module.exports = new Model();
