/**
 * BottleType.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {

        name : {
            type: 'string',
            required: true,
        },

        shortName: {
            type: 'string',
            required: true,
            unique: true
        },

        quantityPerBox: {
            type: 'integer',
            required: true,
        },

        sellPrice: {
            type: 'integer',
            required: true,
        },

        supplierPrice: {
            type: 'integer',
            required: true,
        },

        originalStock: {
            type: 'integer',
            required: true,
        },

    },

    /**
     * Before removing a bottle from the database
     *
     * @param {object} criteria: contains the query with the bottle id
     * @param {function} cb: the callback
     */
    beforeDestroy: function(criteria, cb) {
        BottleType.find(criteria).exec((error, bottleTypes) => {
            if(error) return cb(error);
            // Execute set of rules for each deleted user
            async.each(bottleTypes, (bottleType, cb) => {
                async.parallel([

                    // update the bottleAction where the bottleId is this bottleType
                    cb => BottleAction.update({bottleId: bottleType.id}, {team: null}).exec(cb),

                ], cb);
            }, cb);
        });
    },

    fixtures: {
        bottleType1: {
            name: "La cuvée du patron",
            shortName: "CP",
            quantityPerBox: 4,
            supplierPrice: 6.00,
            sellPrice: 40.00,
            originalStock: 80
        },
        bottleType2: {
            name: "Cire de beauprès",
            shortName: "CB",
            quantityPerBox: 6,
            supplierPrice: 8.00,
            sellPrice: 70.00,
            originalStock: 120
        },
        bottleType3: {
            name: "Le pas du templier",
            shortName: "PT",
            quantityPerBox: 12,
            supplierPrice: 20.00,
            sellPrice: 100.00,
            originalStock: 30
        },
    }

};
