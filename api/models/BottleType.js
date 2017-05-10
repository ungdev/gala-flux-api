const Base = require('./Base');

function Model () {

    this.attributes = {

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


        /**
         * Sell price of a bottle
         */
        sellPrice: {
            type: "float",
            required: true,
        },


        /**
         * Supplier price of a bottle    
         */
        supplierPrice: {
            type: "float",
            required: true,
        },


        /**
         * Number of bottle
         */
        originalStock: {
            type: 'integer',
            required: true,
        },

    };

    // Attribute hidden on when sending to client
    this.hiddenAttr = [];

    // Update will be emitted to client only if another attribute has been updated
    this.ignoredAttrUpdate = [];

    /**
     * Before removing a bottle from the database
     *
     * @param {object} criteria: contains the query with the bottle id
     * @param {function} cb: the callback
     */
    this.beforeDestroy = function(criteria, cb) {
        BottleType.find(criteria).exec((error, bottleTypes) => {
            if(error) return cb(error);
            // Execute set of rules for each deleted user
            async.each(bottleTypes, (bottleType, cb) => {
                async.parallel([

                    // update the bottleAction where the bottleId is this bottleType
                    cb => BottleAction.update2({bottleId: bottleType.id}, {team: null}).exec(cb),

                    ], (error) => {
                        if(error) return cb(error);

                        // Publish destroy event
                        BottleType._publishDestroy(bottleType.id);

                        return cb();
                    }
                );
            }, cb);
        });
    };


    this.fixtures = {
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

}

// Inherit Base Model
Model.prototype = new Base('BottleType');

// Construct and export
module.exports = new Model();
