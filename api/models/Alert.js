/**
 * Alert.js
 *
 * @description :: An alert is a problem to solve. An alert can be created from an AlertButton
 * by a user, or automatically.
 *
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 *
 */
const faker = require('faker');

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

        // users on this alert
        users: {
            collection: "user",
            via: "alerts",
            dominant: true
        }

    },


    /**
     * Before removing a Alert from the database
     *
     * @param {object} criteria: contains the query with the alert id
     * @param {function} cb: the callback
     */
    beforeDestroy: function(criteria, cb) {
        Barrel.find(criteria).exec((error, alerts) => {
            if(error) return cb(error);
            // Execute set of rules for each deleted user
            async.each(alerts, (alert, cb) => {
                async.parallel([

                    // update the alert in the history where the alert is this one
                    cb => AlertHistory.update({alertId: alert.id}, {alertId: null}).exec(cb),

                ], cb);
            }, cb);
        });
    },


    fixtures: {
        alertsPerTeam: function(callback) {
            Team.findOne({name: 'Flux admins'}).exec((err, admin) => {
                if (err) {
                    callback(error);
                }
                Team.find().exec((error, teams) => {
                    if (error) {
                        callback(error);
                    }
                    let result = {};
                    let i = 1;
                    for (team of teams) {
                        result['alert ' + team.name] = {
                            sender: team.id,
                            receiver: admin.id,
                            severity: "warning",
                            title: 'Title: ' + faker.hacker.phrase(),
                            category: "refill",
                            message: 'Message: ' + faker.hacker.phrase()
                        }
                        i++;
                    }
                    return callback(null, result);
                });
            });
        }
    }
};
