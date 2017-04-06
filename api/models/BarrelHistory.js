/**
 * BarrelHistory.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
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

