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

    },

    /**
     * Before removing a AlertButton from the database
     *
     * @param {object} criteria: contains the query with the AlertButton id
     * @param {function} cb: the callback
     */
    beforeDestroy: function(criteria, cb) {
        Barrel.find(criteria).exec((error, alerts) => {
            if(error) return cb(error);
            // Execute set of rules for each deleted user
            async.each(alerts, (alert, cb) => {
                async.parallel([

                    // update the alert  where the button is this one
                    cb => Alert.update({button: alertButton.id}, {button: null}).exec(cb),

                ], cb);
            }, cb);
        });
    },

    fixtures: {
        generateLogAlertButtons: function(callback) {
            // get the teams
            Team.findOne({name: "Log"}).exec((error, team) => {
                if(error) {
                    callback(error);
                }

                let data = {
                    "Technique": [
                        {
                            title: "Problème avec une tireuse",
                            message: true,
                            messagePlaceholder: "Quel est le problème ?"
                        },
                        {
                            title: "Problème avec un fût",
                            message: true,
                            messagePlaceholder: "Quel est le problème ?"
                        }
                    ],
                    "Manque": [
                        {
                            title: "Flutes de champagne",
                            message: false,
                            messagePlaceholder: ""
                        },
                        {
                            title: "Sacs poubelle",
                            message: false,
                            messagePlaceholder: ""
                        },
                        {
                            title: "Gobelets bière",
                            message: false,
                            messagePlaceholder: ""
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
                            receiver: team
                        });
                        i++;
                    }
                }

                return callback(null, result);
            });
        }
    }

};
