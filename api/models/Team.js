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
     * Before removing a Team from the database
     *
     * @param {object} criteria: contains the query with the team id
     * @param {function} cb: the callback
     */
    beforeDestroy: function(criteria, cb) {
        // find the team
        Team.findOne({id: criteria.where.id}).exec((error, team) => {
            // update the messages of this team
            Message.update({senderTeam: team.id}, {senderTeam: null, senderTeamName: team.name}).exec((error, updated) => {
                // destroy the users of this team
                User.destroy({team: team.id}).exec(error => {
                    // update the alerts in the history where the sender is this team
                    AlertHistory.update({sender: team.id}, {sender: null, senderName: team.name}).exec((error, updated) => {
                        // update the alerts in the history where the receiver is this team
                        AlertHistory.update({receiver: team.id}, {receiver: null, receiverName: team.name}).exec((error, updated) => {
                            // destroy the alerts where the sender is this team
                            Alert.destroy({sender: team.id}).exec(error => {
                                // destroy the alerts where the sender is this team
                                Alert.destroy({receiver: team.id}).exec(error => {
                                    // destroy the alert buttons where the receiver is this team
                                    AlertButton.destroy({receiver: team.id}).exec(error => {
                                        cb();
                                    });
                                });
                            });
                        });
                    });
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
