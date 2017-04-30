const Base = require('./Base');

function Model () {

    this.attributes = {

        // full name of the barrel's content (example: Chouffe)
        name: {
            type: "string",
            required: true,
            unique: true
        },

        // short name of the barrel's content (example: CH)
        shortName: {
            type: "string",
            required: true,
            unique: true
        },

        // quantity in liters (example: 25)
        liters: {
            type: "integer",
            required: true
        },

        // the price at which it must be sold
        sellPrice: {
            type: "float",
            required: true
        },

        // purchase price of the barrel
        supplierPrice: {
            type: "float",
            required: true
        }

    };

    // Attribute hidden on when sending to client
    this.hiddenAttr = [];

    // Update will be emitted to client only if another attribute has been updated
    this.ignoredAttrUpdate = [];

    /**
     * Before removing a BarrelType from the database, update the barrels of this type
     *
     * @param {object} criteria: contains the query with the type id
     * @param {function} cb: the callback
     */
    this.beforeDestroy = function(criteria, cb) {
        BarrelType.find(criteria).exec((error, barrelTypes) => {
            if(error) return cb(error);
            // Execute set of rules for each deleted user
            async.each(barrelTypes, (barrelType, cb) => {
                async.parallel([

                    // update the barrel in the history where the receiver is this team
                    cb => BarrelHistory.update2({type: barrelType.id}, {type: null}).exec(cb),

                    // destroy the barrels buttons where the type is this type
                    cb => Barrel.destroy({type: barrelType.id}).exec(cb),

                ], (error) => {
                    if(error) return cb(error);

                    // Publish destroy event
                    BarrelType._publishDestroy(barrelType.id);

                    return cb();
                });
            }, cb);
        });
    };

    this.fixtures = {
        beer1: {
            name: "Maredsous",
            shortName: "MA",
            liters: 30,
            supplierPrice: 123.00,
            sellPrice: 150.00
        },
        beer2: {
            name: "Ch'ti blonde",
            shortName: "CH",
            liters: 30,
            supplierPrice: 118.00,
            sellPrice: 145.00
        },
        beer3: {
            name: "Rince cochon",
            shortName: "RC",
            liters: 30,
            supplierPrice: 141.30,
            sellPrice: 155.00
        },
        beer4: {
            name: "Bière du corbeau",
            shortName: "CO",
            liters: 20,
            supplierPrice: 98.00,
            sellPrice: 110.00
        },
        beer5: {
            name: "Guiness",
            shortName: "GU",
            liters: 30,
            supplierPrice: 141.90,
            sellPrice: 152.00
        }
    };

}

// Inherit Base Model
Model.prototype = new Base('BarrelType');

// Construct and export
module.exports = new Model();
