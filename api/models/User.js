const Sequelize = require('sequelize');
const Flux = require('../../Flux');
const inheritBaseModel = require('./baseModel');

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
        validate: {
            notEmpty: true,
        }
    },

    accessToken: {
        type: Sequelize.STRING,
    },

    renewToken: {
        type: Sequelize.STRING,
    },
},
{
    validate: {
        eitherIpOrLogin() {
            if(Boolean(this.login) == Boolean(this.ip)) {
                throw new Error('Either `login` or `ip` should be present');
            }
        },
    },
});
const Model = User;
Model.buildReferences = () => {
    // This function will be called once all models are initialized by Flux Object.
    Model.belongsTo(Flux.Team, {
        foreignKey: { allowNull: false },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    });
};
inheritBaseModel(User);

/**********************************************
 * Customize User groups
 **********************************************/
Model.getUserReadGroups = (team, user) => {
    let groups = [];
    if(team.can(Model.name + '/read') || team.can(Model.name + '/admin')) {
        groups.push('all');
    }

    // You can always read your own team
    groups.push('id:' + user.id);

    // If you can only edit member of your team
    if(team.can(Model.name + '/team')) {
        groups.push('team:' + team.id);
    }

    return groups;
};
Model.getUserCreateGroups = function(team, user) {
    let groups = [];
    if(team.can(Model.name + '/admin')) {
        groups.push('all');
    }

    // If you can only edit member of your team
    if(team.can(Model.name + '/team')) {
        groups.push('team:' + team.id);
    }

    return groups;
};
Model.getUserUpdateGroups = Model.getUserCreateGroups;
Model.getUserDestroyGroups = Model.getUserCreateGroups;

/**********************************************
 * Customize Item groups
 **********************************************/
Model.prototype.getReadGroups = function() {
    return ['id:' + this.id, 'all', 'team:'+this.teamId];
};
Model.prototype.getCreateGroups = Model.prototype.getReadGroups;
Model.prototype.getUpdateGroups = Model.prototype.getReadGroups;
Model.prototype.getDestroyGroups = Model.prototype.getReadGroups;

/**********************************************
 * Customize Filters
 **********************************************/
Model.getReadFilters = function(team, user) {
    let filters = [];
    let groups = this.getUserReadGroups(team, user);
    for (let group of groups) {
        let split = group.split(':');
        // Can read all
        if(group == 'all') {
            return [{true: true}];
        }
        // Can read only one id
        else if(split.length == 2 && split[0] == 'id') {
            filters.push({'id': split[1]});
        }
        // Can read only one team
        else if(split.length == 2 && split[0] == 'team') {
            filters.push({'teamId': split[1]});
        }
    }
    return filters;
};







module.exports = Model;


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
