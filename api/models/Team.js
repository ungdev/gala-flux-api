/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {

        name : {
            type: 'string',
            required: true,
            unique: true,
        },

        group : {
            type: 'string',
            required: true,
        },

        location : {
            type: 'string',
        },

        members: {
            collection: 'user',
            via: 'team'
        },

        role: {
            type: 'string',
            required: true,
        },
    },


    /**
     * Check if team has the given permission
     *
     * @param  {String}   permission Permission name
     * @return {Promise} return true if user has the permission
     */
    can: function (req, permission) {
        return (Array.isArray(sails.config.roles[req.team.role]) && sails.config.roles[req.team.role].indexOf(permission) !== -1);
    },
};
