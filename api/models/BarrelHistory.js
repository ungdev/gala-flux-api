/**
 * BarrelHistory.js
 *
 * @description :: A BarrelHistory is created each time a Barrel is created or updated. This is a copy of the main
 * attributes of this Barrel. The goal is to log all about barrels.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {

        barrelId: {
            model: "barrel",
            required: true
        },

        type: {
            model: "barreltype",
            required: true
        },

        reference: {
            type: "string",
            required: true,
        },

        place: {
            model: "team",
            defaultsTo: null
        },

        state: {
            type: "string",
            enum: ["new", "opened", "empty"],
            required: true
        }

    },

    pushToHistory(barrel, callback) {

        BarrelHistory.create({
            barrelId: barrel.id,
            type: barrel.type,
            reference: barrel.reference,
            place: barrel.place,
            state: barrel.state
        }).exec((error, barrelHistory) => {
            callback(error, barrelHistory);
        });

    }

};

