const Sequelize = require('sequelize');
const Flux = require('../../Flux');

const User = Flux.sequelize.define('user', {
    login: {
        type: Sequelize.STRING,
        unique: true,
    },

    ip: {
        type: Sequelize.STRING,
        unique: true,
        validate: {
            isIP: true,
        },
    },

    name: {
        type: Sequelize.STRING,
        allowNull: false,
    },

    accessToken: {
        type: Sequelize.STRING,
    },

    renewToken: {
        type: Sequelize.STRING,
    },
});


/**
 * This function will be called once all models are initialized by Flux Object.
 */
User.buildReferences = () => {
    User.belongsTo(Flux.Team, {
        foreignKey: { allowNull: false },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    });
};




/**********************************************
 * User groups
 **********************************************/
User.getUserReadGroups = function(team, user) {
    let groups = [];

    // You can always read your own team
    groups.push('read:id:' + user.id);
    // If you have the right to read all
    if(team.can('user/read') || team.can('user/admin')) {
        groups.push('read:all');
    }

    return groups;
};


User.getUserCreateGroups = function(team, user) {
    // Only admin can update/create/destroy teams
    if(team.can('user/admin')) {
        return ['create:all'];
    }
    return [];
};


User.getUserUpdateGroups = function(team, user) {
    // Only admin can update/create/destroy teams
    if(team.can('user/admin')) {
        return ['update:all'];
    }
    return [];
};


User.getUserDestroyGroups = function(team, user) {
    // Only admin can update/create/destroy teams
    if(team.can('user/admin')) {
        return ['destroy:all'];
    }
    return [];
};

/**********************************************
 * Filters
 **********************************************/
User.getFilters = function(team, user) {
    let filters = [];
    let groups = this.getUserReadGroups(team, user);
    for (let group of groups) {
        let split = group.split(':');
        // Can read all
        if(group == 'read:all') {
            filters.push(true);
            return filters;
        }
        // Can read only one id
        else if(split[0] == 'read' && split[1] == 'id') {
            filters.push({'id': split[2]});
        }
    }
    return filters;
};

/**********************************************
 * Item group
 **********************************************/
User.prototype.getReadGroups = function() {
    return ['read:id:' + this.id, 'read:all'];
};
User.prototype.getCreateGroups = function() {
    return ['create:all'];
};
User.prototype.getUpdateGroups = function() {
    return ['update:all'];
};
User.prototype.getDestroyGroups = function() {
    return ['destroy:all'];
};

module.exports = User;


// const faker = require('faker');
// const Base = require('./Base');
//
// function Model () {
//
//     this.attributes = {
//         login : {
//             type: 'string',
//             unique: true,
//         },
//
//         ip : {
//             type: 'string',
//             unique: true,
//             ip: true,
//         },
//
//         name : {
//             type: 'string',
//             required: true,
//         },
//
//         team: {
//             model: 'team',
//             required: true,
//         },
//
//         accessToken : {
//             type: 'string',
//         },
//
//         renewToken : {
//             type: 'string',
//         },
//
//         // timestamp
//         lastConnection: {
//             type: 'integer',
//             defaultsTo: Date.now(),
//             required: true
//         },
//
//         // timestamp
//         lastDisconnection: {
//             type: 'integer',
//             defaultsTo: Date.now(),
//             required: true
//         }
//     };
//
//     // Attribute hidden on when sending to client
//     this.hiddenAttr = ['accessToken', 'refreshToken', 'tokenExpiration', 'alerts'];
//
//     // Update will be emitted to client only if another attribute has been updated
//     this.ignoredAttrUpdate = ['lastConnection', 'lastDisconnection', 'updatedAt', 'accessToken', 'renewToken', 'alerts'];
//
//     this.fixtures = {
//         ipUserPerTeam: function(callback) {
//             Team.find().exec((error, teams) => {
//                 if(error) {
//                     callback(error);
//                 }
//
//                 let result = {};
//                 let i = 1;
//                 for (let team of teams) {
//                     result['PC ' + team.name] = {
//                         ip: '192.168.0.' + i,
//                         name: 'PC',
//                         team: team.id,
//                     };
//                     i++;
//                 }
//
//                 return callback(null, result);
//             });
//         },
//         etuuttUserPerTeam: function(callback) {
//             Team.find().exec((error, teams) => {
//                 if(error) {
//                     callback(error);
//                 }
//
//                 let result = {};
//                 async.each(teams, (team, cb) => {
//                     async.times((Math.floor(Math.random() * 3) + 2), (n, cb) => {
//                         let name = faker.fake("{{name.firstName}} {{name.lastName}}");
//                         result['Etu ' + team.name + ' ' + (n+1)] = {
//                             login: faker.helpers.slugify(name).substr(0, 8),
//                             name: name,
//                             team: team.id,
//                         };
//                     });
//                 });
//
//                 return callback(null, result);
//             });
//         },
//     };
//
//     /**
//      * Before removing a User from the database, update the message he sent
//      *
//      * @param {object} criteria: contains the query with the user id
//      * @param {function} cb: the callback
//      */
//     this.beforeDestroy = function(criteria, cb) {
//         User.find(criteria).exec((error, users) => {
//
//             // Update foreign entities
//             if(error) return cb(error);
//             // Execute set of rules for each deleted user
//             async.each(users, (user, cb) => {
//                 async.parallel([
//
//                     // Set message without sender
//                     cb => Message.update2({sender: user.id}, {sender: null}).exec(cb),
//
//                 ], (error) => {
//                     if(error) return cb(error);
//
//                     // Publish destroy event
//                     this._publishDestroy(user.id);
//
//                     return cb();
//                 });
//             }, cb);
//         });
//     };
//
//     /**
//      * Check validness of an auth using the provided login
//      *
//      * @param  {String}   login
//      * @param  {Function} cb
//      */
//     this.attemptLoginAuth = function(login, cb) {
//         User.findOne({
//             login: login,
//         })
//         .exec(cb);
//     };
// }
//
// // Inherit Base Model
// Model.prototype = new Base('User');
//
// // Construct and export
// module.exports = new Model();
