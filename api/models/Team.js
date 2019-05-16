const Base = require('./Base');

function Model () {

    this.attributes = {

        name : {
            type: 'string',
            required: true,
            unique: true
        },

        group : {
            type: 'string',
            required: true
        },

        location : {
            type: 'string'
        },

        members: {
            collection: 'user',
            via: 'team'
        },

        sells: {
            type: 'string'
        },

        reloads: {
            type: 'string'
        },

        point: {
            type: 'string'
        },

        role: {
            type: 'string',
            required: true
        }
    };

    // Attribute hidden on when sending to client
    this.hiddenAttr = [];

    // Update will be emitted to client only if another attribute has been updated
    this.ignoredAttrUpdate = [];

    /**
     * Before removing a Team from the database
     *
     * @param {object} criteria: contains the query with the team id
     * @param {function} cb: the callback
     */
    this.beforeDestroy = function(criteria, cb) {
        Team.find(criteria).exec((error, teams) => {
            if(error) return cb(error);

            // Execute set of rules for each deleted user
            async.each(teams, (team, cb) => {
                async.parallel([

                    // destroy the users of this team
                    cb => User.destroy({team: team.id}).exec(cb),

                    // update the bottleAction where the team is this team
                    cb => BottleAction.update2({team: team.id}, {team: null}).exec(cb),
                    // update the bottleAction where fromTeam is this team
                    cb => BottleAction.update2({fromTeam: team.id}, {fromTeam: null}).exec(cb),

                    // update the alerts in the barrelHistory where the receiver is this team
                    cb => BarrelHistory.update2({place: team.id}, {place: null}).exec(cb),
                    // update the alerts in the barrel where the receiver is this team
                    cb => BarrelHistory.update2({place: team.id}, {place: null}).exec(cb),

                    // update the alerts in the history where the sender is this team
                    cb => AlertHistory.update2({sender: team.id}, {sender: null}).exec(cb),
                    // update the alerts in the history where the receiver is this team
                    cb => AlertHistory.update2({receiver: team.id}, {receiver: null}).exec(cb),

                    // destroy the alert buttons where the receiver is this team
                    cb => AlertButton.destroy({receiver: team.id}).exec(cb),

                    // destroy the alerts where the sender is this team
                    cb => Alert.destroy({sender: team.id}).exec(cb),
                    // destroy the alerts where the sender is this team
                    cb => Alert.destroy({receiver: team.id}).exec(cb),
                ], (error) => {
                    if(error) return cb(error);

                    // Publish destroy event
                    Team._publishDestroy(team.id);

                    cb();
                });
            }, cb);
        });
    };

    /**
     * Check if team has the given permission
     *
     * @param  {req|Team}   obj Request `req` object or Team object
     * @param  {String}   permission Permission name
     * @return {boolean} return true if user has the permission
     */
    this.can = function (obj, permission) {
        let team = obj.team ? obj.team : obj;
        return (Array.isArray(sails.config.roles[team.role]) && sails.config.roles[team.role].indexOf(permission) !== -1);
    };

    this.fixtures = {
        bar1: {
            name: 'Bar AS',
            group: 'bar',
            location: 'Chapiteau',
            role: 'Point de vente',
        },
        bar2: {
            name: 'Bar UNG',
            group: 'bar',
            location: 'Hall N',
            role: 'Point de vente',
        },
        bar3: {
            name: 'Bar ISM',
            group: 'bar',
            location: 'Amphi ext',
            role: 'Point de vente',
        },
        jeton1: {
            name: 'Rechargement Etu',
            group: 'rechargement',
            location: 'Hall Etu',
            role: 'Point de vente',
        },
        jeton2: {
            name: 'Rechargement Entree',
            group: 'rechargement',
            location: 'Entree',
            role: 'Point de vente',
        },
        log: {
            name: 'Logistique',
            group: 'orga',
            location: 'Foyer',
            role: 'Logistique',
        },
        sl: {
            name: 'S&L',
            group: 'orga',
            location: '',
            role: 'Orga',
        },
        secutt: {
            name: 'SecUTT',
            group: 'orga',
            location: 'Poste de secours',
            role: 'SecUTT',
        },
        coord: {
            name: 'Coord',
            group: 'orga',
            location: 'QG',
            role: 'Coord',
        },
        admin: {
            name: 'Flux',
            group: 'orga',
            location: 'Salle asso',
            role: 'Admin',
        },
    };
}

// Inherit Base Model
Model.prototype = new Base('Team');

// Construct and export
module.exports = new Model();
