/**
 * Session.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {

        user: {
            model: "user",
            required: true
        },

        androidId: {
            type: "string"
        },

        firebaseToken: {
            type: "string",
            required: true
        },

        socketId: {
            type: "string"
        },

        // timestamp
        lastAction: {
            type: 'integer',
            defaultsTo: Date.now(),
            required: true
        },

        // timestamp
        disconnectedAt: {
            type: 'integer',
            defaultsTo: Date.now(),
            required: true
        }

    }

};

