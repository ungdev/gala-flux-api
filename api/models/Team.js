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
     * Before removing a Team from the database, update the users and messages linked to this team
     *
     * @param {object} criteria: contains the query with the team id
     * @param {function} cb: the callback
     */
    beforeDestroy: function(criteria, cb) {
        Team.findOne({id: criteria.where.id})
            .exec((error, team) => {
                Message.update({senderTeam: team.id}, {senderTeam: null, senderTeamName: team.name})
                    .exec((error, updated) => {
                        User.destroy({team: team.id})
                            .exec(error => {
                                cb();
                            });
                    });
            });
    },

    /**
     * Check if team has the given permission
     *
     * @param  {req|Team}   obj Request `req` object or Team object
     * @param  {String}   permission Permission name
     * @return {boolean} return true if user has the permission
     */
    can: function (obj, permission) {
        let team = obj.team ? obj.team : obj;
        return (Array.isArray(sails.config.roles[team.role]) && sails.config.roles[team.role].indexOf(permission) !== -1);
    },


    fixtures: {
        bar1: {
            name: 'Bar AS',
            group: 'bar',
            location: 'Chapiteau',
            role: 'bar',
        },
        bar2: {
            name: 'Bar UNG',
            group: 'bar',
            location: 'Hall N',
            role: 'bar',
        },
        bar3: {
            name: 'Bar ISM',
            group: 'bar',
            location: 'Amphi ext',
            role: 'bar',
        },
        jeton1: {
            name: 'Jeton Etu',
            group: 'jeton',
            location: 'Hall Etu',
            role: 'jeton',
        },
        jeton2: {
            name: 'Jeton Entree',
            group: 'jeton',
            location: 'Hall Entree',
            role: 'jeton',
        },
        log: {
            name: 'Log',
            group: 'orga',
            location: 'Foyer',
            role: 'log',
        },
        secutt: {
            name: 'Secutt',
            group: 'orga',
            location: 'Poste de secours',
            role: 'secutt',
        },
        coord: {
            name: 'Coord',
            group: 'orga',
            location: 'QG',
            role: 'coord',
        },
        admin: {
            name: 'Flux admins',
            group: 'orga',
            location: 'Salle asso',
            role: 'admin',
        },
    },
};
