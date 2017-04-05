/**
 * Barrel.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {

        type: {
            model: "barreltype",
            required: true
        },

        reference: {
            type: "string",
            required: true,
            unique: true
        },

        // the integer part of the barrel's reference
        num: {
            type: "integer",
            required: true
        },

        place: {
            model: "team",
            defaultsTo: null
        },

        state: {
            type: "string",
            enum: ["new", "opened", "empty"],
            required: true,
            defaultsTo: "new"
        }

    }

};

