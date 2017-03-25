/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {

        text : {
            type: 'mediumtext',
            required: true,
        },

        senderUser: {
            model: 'user',
            required: true,
        },

        senderTeam: {
            model: 'team',
            required: true,
        },

        channel: {
            type: 'string',
            required: true,
        },
    },

    /**
     * Convert a string to channel name
     *
     * @param  {String}  name Original name like team name or group name
     * @return {String} return channel name (without #)
     */
    toChannel: function (name) {
        return name.replace(/[^a-z0-9]/gi,'-').replace(/[-]+/gi,'-').toLowerCase();
    },
};
