/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {

        login : {
            type: 'string',
        },

        ip : {
            type: 'string',
        },

        name : {
            type: 'string',
        },

        email : {
            type: 'string',
        },

        studentId : {
            type: 'string',
        },
    },


    /**
     * Check validness of a login using the provided ip
     *
     * @param  {String}   ip
     * @param  {Function} cb
     */
    attemptIpAuth: function (ip, cb) {
        User.findOne({
            ip: ip,
        })
        .exec(cb);
    },

    /**
     * Check validness of a login using the provided login
     *
     * @param  {String}   login
     * @param  {Function} cb
     */
    attemptLoginAuth: function (login, cb) {
        User.findOne({
            login: login,
        })
        .exec(cb);
    }
};
