const Base = require('./Base');
const faker = require('faker');

function Model () {

    this.attributes = {

        // the barrel's type
        type: {
            model: "barreltype"
        },

        // If the barrel type is deleted, his name will be saved in this attribute
        typeName: {
            type: "string"
        },

        // unique reference : type's shortName + (number of barrels of this type + 1)
        reference: {
            type: "string",
            required: true,
        },

        // (number of barrels of this type + 1)
        num: {
            type: "integer",
            required: true
        },

        // null if not allocated to a bar (a team) or team deleted. Else, the team.
        place: {
            model: "team",
            defaultsTo: null
        },

        // the barrel's state :
        // new = not opened
        // opened = in use
        // empty
        state: {
            type: "string",
            enum: ["new", "opened", "empty"],
            required: true,
            defaultsTo: "new"
        }

    };

    // Attribute hidden on when sending to client
    this.hiddenAttr = [];

    // Update will be emitted to client only if another attribute has been updated
    this.ignoredAttrUpdate = [];


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
        sails.sockets.broadcast('barrel/' + newlyInsertedRecord.place, 'barrel', data);
        Barrel.publishCreate(newlyInsertedRecord);
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
        sails.sockets.broadcast('barrel/' + currentRecord.place, 'barrel', data);
        if(currentRecord.place != valuesToUpdate.place) {
            sails.sockets.broadcast('barrel/' + valuesToUpdate.place, 'barrel', data);
        }
        Barrel.publishUpdate(valuesToUpdate.id, valuesToUpdate);
    };

    /**
     * Before removing a Barrel from the database
     *
     * @param {object} criteria: contains the query with the barrel id
     * @param {function} cb: the callback
     */
    this.beforeDestroy = function(criteria, cb) {
        Barrel.find(criteria).exec((error, barrels) => {
            if(error) return cb(error);
            // Execute set of rules for each deleted user
            async.each(barrels, (barrel, cb) => {
                async.parallel([

                    // update the barrel in the history where the receiver is this team
                    cb => BarrelHistory.update2({barrelId: barrel.id}, {barrelId: null}).exec(cb),


                ], (error) => {
                    if(error) return cb(error);

                    // Publish destroy event
                    let data = {
                        verb: 'destroyed',
                        id: barrel.id,
                    };
                    sails.sockets.broadcast('barrel/' + barrel.place, 'barrel', data);
                    Barrel.publishDestroy(barrel.id);

                    return cb();
                });
            }, cb);
        });
    };



    this.fixtures = {
        generateBarrels: function(callback) {
            // get the teams
            Team.find().exec((error, teams) => {
                if(error) {
                    callback(error);
                }

                // get barrel types
                BarrelType.find().exec((error, types) => {
                    if(error) {
                        callback(error);
                    }

                    let result = {};
                    let states = ["new", "opened", "empty"];

                    // for each barrel type
                    for (let type of types) {

                        let barrelNum = 0;

                        // for each possible barrel state
                        for (let state of states) {

                            // generate a random number barrel
                            let n = generateRandomInteger(10, 20);
                            while (n--) {
                                result["barrel" + type.name + barrelNum] = {
                                    type,
                                    state,
                                    num: barrelNum,
                                    reference: type.shortName + barrelNum,
                                    createdAt: faker.date.recent(),
                                    // rand the barrel place
                                    place: Math.random() > 0.7 ? null : teams[Math.floor(Math.random() * teams.length)],
                                };
                                barrelNum++;
                            }
                        }
                    }

                    return callback(null, result);
                });
            });
        }
    };

}

// Inherit Base Model
Model.prototype = new Base('Barrel');

// Construct and export
module.exports = new Model();

/**
 * Generate a random integer between min and max
 *
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function generateRandomInteger(min, max) {
    return Math.floor(max - Math.random()*(max-min));
}
