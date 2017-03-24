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
            unique: true,
        },

        ip : {
            type: 'string',
            unique: true,
            ip: true,
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

        team: {
            model: 'team',
            required: true,
        },

        accessToken : {
            type: 'string',
        },
        renewToken : {
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
     * Check validness of an auth using the provided login
     *
     * @param  {String}   login
     * @param  {Function} cb
     */
    attemptLoginAuth: function (login, cb) {
        User.findOne({
            login: login,
        })
        // If the database has no user, we create the first admin user with this login
        .exec((error, result) => {
            if(!error && !result) {
                User.count((error, result) => {
                    if(result === 0) {
                        sails.log.warn('The database contain no users. We will create an admin user with the login: '+login);
                        Team.create({
                            name: 'Admins',
                            role: 'admin',
                            group: 'orga',
                        }).exec((error, team) => {
                            if(error) {
                                cb(error);
                            }
                            else {
                                User.create({
                                    login: login,
                                    team: team.id,
                                }).exec(cb);
                            }
                        });
                    }
                    else {
                        cb(error, result);
                    }
                })
            }
            else {
                cb(error, result);
            }
        });
    },
};
