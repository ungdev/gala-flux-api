/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
const faker = require('faker');

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
            required: true,
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

        // alerts assigned to this user
        alerts: {
            collection: "alert",
            via: "users"
        },

        // timestamp
        lastConnection: {
            type: 'integer',
            defaultsTo: Date.now(),
            required: true
        },

        // timestamp
        lastDisconnection: {
            type: 'integer',
            defaultsTo: Date.now(),
            required: true
        }
    },

    /**
     * Before removing a User from the database, update the message he sent
     *
     * @param {object} criteria: contains the query with the user id
     * @param {function} cb: the callback
     */
    beforeDestroy: function(criteria, cb) {
        User.find(criteria).exec((error, users) => {

            // Update foreign entities
            if(error) return cb(error);
            // Execute set of rules for each deleted user
            async.each(users, (user, cb) => {
                async.parallel([

                    // Set message without sender
                    cb => Message.update({sender: user.id}, {sender: null}).exec(cb),

                ], cb);
            }, cb);
        });
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
        .exec(cb);
    },

    fixtures: {
        ipUserPerTeam: function(callback) {
            Team.find().exec((error, teams) => {
                if(error) {
                    callback(error);
                }

                let result = {};
                let i = 1;
                for (team of teams) {
                    result['PC ' + team.name] = {
                        ip: '192.168.0.' + i,
                        name: 'PC',
                        team: team.id,
                    };
                    i++;
                }

                return callback(null, result);
            });
        },
        etuuttUserPerTeam: function(callback) {
            Team.find().exec((error, teams) => {
                if(error) {
                    callback(error);
                }

                let result = {};
                async.each(teams, (team, cb) => {
                    async.times((Math.floor(Math.random() * 3) + 2), (n, cb) => {
                        let name = faker.fake("{{name.firstName}} {{name.lastName}}");
                        result['Etu ' + team.name + ' ' + (n+1)] = {
                            login: faker.helpers.slugify(name).substr(0, 8),
                            name: name,
                            team: team.id,
                        }
                    });
                });

                return callback(null, result);
            });
        },
    },
};

/**
 * Update the Messages sent by a given user
 *
 * @param {object} user
 * @return {boolean|error}: true is success, the error is failure
 */
function updateUserMessages(user) {
    Message.update({sender: user.id}, {sender: null, senderName: user.name})
        .exec((error, updated) => {
            if (error) return error;
            return true;
        });
}
