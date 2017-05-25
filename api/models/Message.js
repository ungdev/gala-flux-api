const Sequelize = require('sequelize');
const Flux = require('../../Flux');
const inheritBaseModel = require('./baseModel');

const Message = Flux.sequelize.define('messsage', {

    text: {
        type: Sequelize.TEXT,
        allowNull: false,
    },

    channel: {
        type: Sequelize.STRING,
        allowNull: false,
    },
});
const Model = Message;
Model.buildReferences = () => {
    // This function will be called once all models are initialized by Flux Object.
    Model.belongsTo(Flux.User, {
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
    });
};
inheritBaseModel(Message);


/**
 * Convert a string to channel name
 *
 * @param  {String} name Original name like team name or group name
 * @return {String} return channel name (without #)
 */
Model.toChannel = function(name) {
    return name.replace(':','-');
};



module.exports = Model;
//
//     /**
//      * Publish create to client.
//      *
//      * @param {object} newlyInsertedRecord New item
//      */
//     this._publishCreate = function(newlyInsertedRecord) {
//         let data = {
//             verb: 'created',
//             id: newlyInsertedRecord.id,
//             data: newlyInsertedRecord,
//         };
//         sails.sockets.broadcast('message/' + newlyInsertedRecord.channel, 'message', data);
//
//         let prefix = newlyInsertedRecord.channel.substr(0, newlyInsertedRecord.channel.indexOf(':'));
//         sails.sockets.broadcast('message/' + prefix + ':*', 'message', data);
//
//         Message.publishCreate(newlyInsertedRecord);
//     };
//
//     /**
//      * Publish update to client.
//      *
//      * @param {id} id Id to update
//      * @param {object} valuesToUpdate Values to update
//      */
//     this._publishUpdate = function(id, valuesToUpdate) {
//         let data = {
//             verb: 'updated',
//             id: valuesToUpdate.id,
//             data: valuesToUpdate,
//         };
//         sails.sockets.broadcast('message/' + valuesToUpdate.channel, 'message', data);
//
//         let prefix = valuesToUpdate.channel.substr(0, valuesToUpdate.channel.indexOf(':'));
//         sails.sockets.broadcast('message/' + prefix + ':*', 'message', data);
//         Message.publishUpdate(valuesToUpdate.id, valuesToUpdate);
//     };
//
//     /**
//      * Before removing an item from the database
//      *
//      * @param {object} criteria contains the query with the user id
//      * @param {function} cb the callback
//      */
//     this.beforeDestroy = function(criteria, cb) {
//         let error = new Error("It's forbidden to destroy an item of this model.");
//         sails.log.error(error);
//         return cb(error);
//     };
//
//
//     this.fixtures = {
//         // Fixtures of message from user that have post in their own public channel
//         ownPublicChannel: function(callback) {
//             Team.autoCreatedAt = false;
//             User.find().populate('team').exec((error, users) => {
//                 if(error) {
//                     callback(error);
//                 }
//
//                 let result = {};
//                 for (let user of users) {
//                     if(Team.can(user.team, 'message/oneChannel') ||
//                         Team.can(user.team, 'message/public') ||
//                         Team.can(user.team, 'message/admin')) {
//                         result['ownPublicChannel ' + user.name] = {
//                             text: 'Hello, I try to send in my own public channel. ' + faker.hacker.phrase(),
//                             sender: user,
//                             channel: 'public:' + Message.toChannel(user.team.name),
//                             createdAt: faker.date.recent(),
//                         };
//                     }
//                 }
//
//                 return callback(null, result);
//             });
//         },
//
//         // Fixtures of message from user that send to others public channel
//         otherPublicChannel: function(callback) {
//             Team.autoCreatedAt = false;
//             User.find().populate('team').exec((error, users) => {
//                 if(error) {
//                     callback(error);
//                 }
//
//                 let result = {};
//                 for (let user of users) {
//                     if(Team.can(user.team, 'message/public') ||
//                         Team.can(user.team, 'message/admin')) {
//                         result['otherPublicChannel ' + user.name] = {
//                             text: 'Hello, I try to send in the public channel of another team. ' + faker.hacker.phrase(),
//                             sender: user,
//                             channel: 'public:' + Message.toChannel(users[Math.floor(Math.random()*users.length)].team.name),
//                             createdAt: faker.date.recent(),
//                         };
//                     }
//                 }
//
//                 return callback(null, result);
//             });
//         },
//
//         // Fixtures of message from user that send to group
//         groupChannel: function(callback) {
//             Team.autoCreatedAt = false;
//             User.find().populate('team').exec((error, users) => {
//                 if(error) {
//                     callback(error);
//                 }
//
//                 let result = {};
//                 for (let user of users) {
//                     if(Team.can(user.team, 'message/group') ||
//                         Team.can(user.team, 'message/admin')) {
//                         result['groupChannel ' + user.name] = {
//                             text: 'Hello, I try to send in a group channel. ' + faker.hacker.phrase(),
//                             sender: user,
//                             channel: 'group:' + Message.toChannel(users[Math.floor(Math.random()*users.length)].team.group),
//                             createdAt: faker.date.recent(),
//                         };
//                     }
//                 }
//
//                 return callback(null, result);
//             });
//         },
//
//         // Fixtures of message from user that send in its own private channel
//         privateChannel: function(callback) {
//             Team.autoCreatedAt = false;
//             User.find().populate('team').exec((error, users) => {
//                 if(error) {
//                     callback(error);
//                 }
//
//                 let result = {};
//                 for (let user of users) {
//                     if(Team.can(user.team, 'message/private') ||
//                         Team.can(user.team, 'message/admin')) {
//                         result['privateChannel ' + user.name] = {
//                             text: 'Hello, I try to send in my private channel. ' + faker.hacker.phrase(),
//                             sender: user,
//                             channel: 'private:' + Message.toChannel(user.team.name),
//                             createdAt: faker.date.recent(),
//                         };
//                     }
//                 }
//
//                 return callback(null, result);
//             });
//         },
//
//         // Fixtures of message from user that send in others private channel
//         otherPrivateChannel: function(callback) {
//             Team.autoCreatedAt = false;
//             User.find().populate('team').exec((error, users) => {
//                 if(error) {
//                     callback(error);
//                 }
//
//                 let result = {};
//                 for (let user of users) {
//                     if(Team.can(user.team, 'message/admin')) {
//                         result['otherPrivateChannel ' + user.name] = {
//                             text: 'Hello, I try to send in private channel of other teams. ' + faker.hacker.phrase(),
//                             sender: user,
//                             channel: 'private:' + Message.toChannel(users[Math.floor(Math.random()*users.length)].team.name),
//                             createdAt: faker.date.recent(),
//                         };
//                     }
//                 }
//
//                 return callback(null, result);
//             });
//         },
//     };
// }
//
// // Inherit Base Model
// Model.prototype = new Base('Message');
//
// // Construct and export
// module.exports = new Model();
