/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
const faker = require('faker');

module.exports = {

    attributes: {

        text : {
            type: 'mediumtext',
            required: true,
        },

        senderUser: {
            model: 'user'
        },

        senderUserName: {
            type: "string"
        },

        senderTeam: {
            model: 'team'
        },

        senderTeamName: {
            type: "string"
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

    fixtures: {
        // Fixtures of message from user that have post in their own public channel
        ownPublicChannel: function(callback) {
            Team.autoCreatedAt = false;
            User.find().populate('team').exec((error, users) => {
                if(error) {
                    callback(error);
                }

                let result = {};
                for (user of users) {
                    if(Team.can(user.team, 'message/oneChannel')
                        || Team.can(user.team, 'message/public')
                        || Team.can(user.team, 'message/admin')) {
                        result['ownPublicChannel ' + user.name] = {
                            text: 'Hello, I try to send in my own public channel. ' + faker.hacker.phrase(),
                            senderUser: user,
                            senderTeam: user.team,
                            channel: 'public:' + Message.toChannel(team.name),
                            createdAt: faker.date.recent(),
                        }
                    }
                }

                return callback(null, result);
            });
        },

        // Fixtures of message from user that send to others public channel
        otherPublicChannel: function(callback) {
            Team.autoCreatedAt = false;
            User.find().populate('team').exec((error, users) => {
                if(error) {
                    callback(error);
                }

                let result = {};
                for (user of users) {
                    if(Team.can(user.team, 'message/public')
                        || Team.can(user.team, 'message/admin')) {
                        result['otherPublicChannel ' + user.name] = {
                            text: 'Hello, I try to send in the public channel of another team. ' + faker.hacker.phrase(),
                            senderUser: user,
                            senderTeam: user.team,
                            channel: 'public:' + Message.toChannel(users[Math.floor(Math.random()*users.length)].team.name),
                            createdAt: faker.date.recent(),
                        }
                    }
                }

                return callback(null, result);
            });
        },

        // Fixtures of message from user that send to group
        groupChannel: function(callback) {
            Team.autoCreatedAt = false;
            User.find().populate('team').exec((error, users) => {
                if(error) {
                    callback(error);
                }

                let result = {};
                for (user of users) {
                    if(Team.can(user.team, 'message/group')
                        || Team.can(user.team, 'message/admin')) {
                        result['groupChannel ' + user.name] = {
                            text: 'Hello, I try to send in a group channel. ' + faker.hacker.phrase(),
                            senderUser: user,
                            senderTeam: user.team,
                            channel: 'group:' + Message.toChannel(users[Math.floor(Math.random()*users.length)].team.group),
                            createdAt: faker.date.recent(),
                        }
                    }
                }

                return callback(null, result);
            });
        },

        // Fixtures of message from user that send in its own private channel
        privateChannel: function(callback) {
            Team.autoCreatedAt = false;
            User.find().populate('team').exec((error, users) => {
                if(error) {
                    callback(error);
                }

                let result = {};
                for (user of users) {
                    if(Team.can(user.team, 'message/private')
                        || Team.can(user.team, 'message/admin')) {
                        result['privateChannel ' + user.name] = {
                            text: 'Hello, I try to send in my private channel. ' + faker.hacker.phrase(),
                            senderUser: user,
                            senderTeam: user.team,
                            channel: 'private:' + Message.toChannel(user.team.name),
                            createdAt: faker.date.recent(),
                        }
                    }
                }

                return callback(null, result);
            });
        },

        // Fixtures of message from user that send in others private channel
        otherPrivateChannel: function(callback) {
            Team.autoCreatedAt = false;
            User.find().populate('team').exec((error, users) => {
                if(error) {
                    callback(error);
                }

                let result = {};
                for (user of users) {
                    if(Team.can(user.team, 'message/admin')) {
                        result['otherPrivateChannel ' + user.name] = {
                            text: 'Hello, I try to send in private channel of other teams. ' + faker.hacker.phrase(),
                            senderUser: user,
                            senderTeam: user.team,
                            channel: 'private:' + Message.toChannel(users[Math.floor(Math.random()*users.length)].team.name),
                            createdAt: faker.date.recent(),
                        }
                    }
                }

                return callback(null, result);
            });
        },
    },
};
