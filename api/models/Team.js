const Sequelize = require('sequelize');
const Flux = require('../../Flux');

const Team = Flux.sequelize.define('team', {

    name : {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
    },

    group : {
        type: Sequelize.STRING,
        allowNull: false,
    },

    location : {
        type: Sequelize.STRING,
    },

    role: {
        type: Sequelize.STRING,
        allowNull: false,
    },
});

/**
 * Check team permission
 * @param {string} permission Permission name
 * @return true if the team has the given permission
 */
Team.prototype.can = function(permission) {
    return (Array.isArray(Flux.config.roles[this.role]) && Flux.config.roles[this.role].indexOf(permission) !== -1);
};




Team.getUserReadGroups = function(team, user) {
    let groups = [];

    // You can always read your own team
    groups.push('read:id:' + team.id);
    // If you have the right to read all
    if(team.can('team/read') || team.can('team/admin')) {
        groups.push('read:all');
    }

    return groups;
};


Team.getUserCreateGroups = function(team, user) {
    // Only admin can update/create/destroy teams
    if(team.can('team/admin')) {
        return ['create:all'];
    }
    return [];
};


Team.getUserUpdateGroups = function(team, user) {
    // Only admin can update/create/destroy teams
    if(team.can('team/admin')) {
        return ['update:all'];
    }
    return [];
};


Team.getUserDestroyGroups = function(team, user) {
    // Only admin can update/create/destroy teams
    if(team.can('team/admin')) {
        return ['destroy:all'];
    }
    return [];
};

Team.getFilters = function(team, user) {
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

Team.prototype.getReadGroups = function() {
    return ['read:id:' + this.id, 'read:all'];
};

Team.prototype.getCreateGroups = function() {
    return ['create:all'];
};

Team.prototype.getUpdateGroups = function() {
    return ['update:all'];
};

Team.prototype.getDestroyGroups = function() {
    return ['destroy:all'];
};

module.exports = Team;

// const Base = require('./Base');
//
// function Model () {
//
//     this.attributes = {
//
//         name : {
//             type: 'string',
//             required: true,
//             unique: true,
//         },
//
//         group : {
//             type: 'string',
//             required: true,
//         },
//
//         location : {
//             type: 'string',
//         },
//
//         members: {
//             collection: 'user',
//             via: 'team'
//         },
//
//         role: {
//             type: 'string',
//             required: true,
//         },
//     };
//
//     // Attribute hidden on when sending to client
//     this.hiddenAttr = [];
//
//     // Update will be emitted to client only if another attribute has been updated
//     this.ignoredAttrUpdate = [];
//
//     /**
//      * Before removing a Team from the database
//      *
//      * @param {object} criteria: contains the query with the team id
//      * @param {function} cb: the callback
//      */
//     this.beforeDestroy = function(criteria, cb) {
//         Team.find(criteria).exec((error, teams) => {
//             if(error) return cb(error);
//
//             // Execute set of rules for each deleted user
//             async.each(teams, (team, cb) => {
//                 async.parallel([
//
//                     // destroy the users of this team
//                     cb => User.destroy({team: team.id}).exec(cb),
//
//                     // update the bottleAction where the team is this team
//                     cb => BottleAction.update2({team: team.id}, {team: null}).exec(cb),
//                     // update the bottleAction where fromTeam is this team
//                     cb => BottleAction.update2({fromTeam: team.id}, {fromTeam: null}).exec(cb),
//
//                     // update the alerts in the barrelHistory where the receiver is this team
//                     cb => BarrelHistory.update2({place: team.id}, {place: null}).exec(cb),
//                     // update the alerts in the barrel where the receiver is this team
//                     cb => BarrelHistory.update2({place: team.id}, {place: null}).exec(cb),
//
//                     // update the alerts in the history where the sender is this team
//                     cb => AlertHistory.update2({sender: team.id}, {sender: null}).exec(cb),
//                     // update the alerts in the history where the receiver is this team
//                     cb => AlertHistory.update2({receiver: team.id}, {receiver: null}).exec(cb),
//
//                     // destroy the alert buttons where the receiver is this team
//                     cb => AlertButton.destroy({receiver: team.id}).exec(cb),
//
//                     // destroy the alerts where the sender is this team
//                     cb => Alert.destroy({sender: team.id}).exec(cb),
//                     // destroy the alerts where the sender is this team
//                     cb => Alert.destroy({receiver: team.id}).exec(cb),
//                 ], (error) => {
//                     if(error) return cb(error);
//
//                     // Publish destroy event
//                     Team._publishDestroy(team.id);
//
//                     cb();
//                 });
//             }, cb);
//         });
//     };
//
//     /**
//      * Check if team has the given permission
//      *
//      * @param  {req|Team}   obj Request `req` object or Team object
//      * @param  {String}   permission Permission name
//      * @return {boolean} return true if user has the permission
//      */
//     this.can = function (obj, permission) {
//         let team = obj.team ? obj.team : obj;
//         return (Array.isArray(sails.config.roles[team.role]) && sails.config.roles[team.role].indexOf(permission) !== -1);
//     };
//
//     this.fixtures = {
//         bar1: {
//             name: 'Bar AS',
//             group: 'bar',
//             location: 'Chapiteau',
//             role: 'Point de vente',
//         },
//         bar2: {
//             name: 'Bar UNG',
//             group: 'bar',
//             location: 'Hall N',
//             role: 'Point de vente',
//         },
//         bar3: {
//             name: 'Bar ISM',
//             group: 'bar',
//             location: 'Amphi ext',
//             role: 'Point de vente',
//         },
//         jeton1: {
//             name: 'Rechargement Etu',
//             group: 'rechargement',
//             location: 'Hall Etu',
//             role: 'Point de vente',
//         },
//         jeton2: {
//             name: 'Rechargement Entree',
//             group: 'rechargement',
//             location: 'Entree',
//             role: 'Point de vente',
//         },
//         log: {
//             name: 'Logistique',
//             group: 'orga',
//             location: 'Foyer',
//             role: 'Logistique',
//         },
//         sl: {
//             name: 'S&L',
//             group: 'orga',
//             location: '',
//             role: 'Orga',
//         },
//         secutt: {
//             name: 'SecUTT',
//             group: 'orga',
//             location: 'Poste de secours',
//             role: 'SecUTT',
//         },
//         coord: {
//             name: 'Coord',
//             group: 'orga',
//             location: 'QG',
//             role: 'Coord',
//         },
//         admin: {
//             name: 'Flux',
//             group: 'orga',
//             location: 'Salle asso',
//             role: 'Admin',
//         },
//     };
// }
//
// // Inherit Base Model
// Model.prototype = new Base('Team');
//
// // Construct and export
// module.exports = new Model();
