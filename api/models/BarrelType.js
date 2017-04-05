/**
 * BarrelType.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {

        name: {
            type: "string",
            required: true,
            unique: true
        },

        shortName: {
            type: "string",
            required: true,
            unique: true
        },

        liters: {
            type: "integer",
            required: true
        },

        sellPrice: {
            type: "float",
            required: true
        },

        supplierPrice: {
            type: "float",
            required: true
        }

    }

};

