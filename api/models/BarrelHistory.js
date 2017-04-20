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


    /**
     * Will a barrel state to the history
     *
     * @param  {Barrel|Array} barrel   Can be a single object or an array of object for bulk operations
     * @param  {type} callback description
     * @return {type}          description
     */
    pushToHistory(barrel, callback) {
        let data = [];
        if(Array.isArray(barrel)) {
            for (let item of barrel) {
                data.push({
                    barrelId: item.id,
                    type: item.type,
                    reference: item.reference,
                    place: item.place,
                    state: item.state
                })
            }
        }
        else {
            data = {
                barrelId: barrel.id,
                type: barrel.type,
                reference: barrel.reference,
                place: barrel.place,
                state: barrel.state
            };
        }

        BarrelHistory.create(data).exec((error, barrelHistory) => {
            callback(error, barrelHistory);
        });

    }

};
