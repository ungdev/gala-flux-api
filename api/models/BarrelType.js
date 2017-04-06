/**
 * BarrelType.js
 *
 * @description :: Represents a type of Barrel.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {

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

    }

};

