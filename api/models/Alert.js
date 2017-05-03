const Base = require('./Base');
const faker = require('faker');

function Model () {

    this.attributes = {

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
            type: "array",
            defaultsTo: [],
        }

    };

    /**
     * Before removing a Alert from the database
     *
     * @param {object} criteria: contains the query with the alert id
     * @param {function} cb: the callback
     */
    this.beforeDestroy = function(criteria, cb) {
        Alert.find(criteria).exec((error, alerts) => {
            if(error) return cb(error);
            // Execute set of rules for each deleted user
            async.each(alerts, (alert, cb) => {
                async.parallel([

                    // update the alert in the history where the alert is this one
                    cb => AlertHistory.update2({alertId: alert.id}, {alertId: null}).exec(cb),

                ], (error) => {
                    if(error) return cb(error);

                    // Publish destroy event
                    let data = {
                        verb: 'destroyed',
                        id: alert.id,
                    };
                    sails.sockets.broadcast('alert/' + alert.sender, 'alert', data);
                    sails.sockets.broadcast('alert/' + alert.receiver, 'alert', data);
                    Alert.publishDestroy(alert.id);

                    return cb();
                });
            }, cb);
        });
    };

    /**
     * Publish create to client.
     *
     * @param {object} newlyInsertedRecord New item
     */
    this._publishCreate = function(newlyInsertedRecord) {
        // Publish
        let data = {
            verb: 'created',
            id: newlyInsertedRecord.id,
            data: newlyInsertedRecord,
        };
        sails.sockets.broadcast('alert/' + newlyInsertedRecord.sender, 'alert', data);
        sails.sockets.broadcast('alert/' + newlyInsertedRecord.receiver, 'alert', data);
        Alert.publishCreate(newlyInsertedRecord);
    };



    /**
     * Publish update to client.
     *
     * @param {id} id Id to update
     * @param {object} valuesToUpdate Values to update
     * @param {object} currentRecord Current value
     */
    this._publishUpdate = function(id, valuesToUpdate, currentRecord) {
        let data = {
            verb: 'updated',
            id: valuesToUpdate.id,
            data: valuesToUpdate,
        };
        sails.sockets.broadcast('alert/' + valuesToUpdate.sender, 'alert', data);
        sails.sockets.broadcast('alert/' + valuesToUpdate.receiver, 'alert', data);
        Alert.publishUpdate(valuesToUpdate.id, valuesToUpdate);
    };


    this.fixtures = {
        alertsPerTeam: function(callback) {
            Team.findOne({name: 'Flux'}).exec((err, admin) => {
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

}

// Inherit Base Model
Model.prototype = new Base('Alert');

// Construct and export
module.exports = new Model();
