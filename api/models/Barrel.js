/**
 * Barrel.js
 *
 * @description :: Represents a physical barrel (The Chouffe barrel number 2 for example).
 * A barrel is linked to a BarrelType.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
const faker = require('faker');

module.exports = {

    attributes: {

        // the barrel's type
        type: {
            model: "barreltype",
            required: true
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

        // null if not allocated to a bar (a team). Else, the team.
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

    },

    fixtures: {
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
    }

};

/**
 * Generate a random integer between min and max
 *
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function generateRandomInteger(min, max) {
    return Math.floor(max - Math.random()*(max-min))
}
