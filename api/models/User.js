const Sequelize = require('sequelize');
const Flux = require('../../Flux');
const inheritBaseModel = require('../../lib/BaseModel');

const User = Flux.sequelize.define('user', {
    login: {
        type: Sequelize.STRING(191),
        unique: true,
    },

    ip: {
        type: Sequelize.STRING(191),
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

    preferences: {
        type: Sequelize.TEXT,
        get: function () {
            let value = this.getDataValue('preferences');
            if(!value) return [];
            return JSON.parse(value);
        },
        set: function (value) {
            this.setDataValue('preferences', JSON.stringify(value));
        },
    },

    accessToken: {
        type: Sequelize.STRING,
    },

    refreshToken: {
        type: Sequelize.STRING,
    },

    tokenExpiration: {
        type: Sequelize.DATE,
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
        hooks: true,
    });

    Model.hasMany(Flux.Session, {
        hooks: true,
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    });

    Model.hasMany(Flux.Message, {
        hooks: true,
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
    });

    Model.hasMany(Flux.ErrorLog, {
        hooks: true,
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
    });
};
inheritBaseModel(User);

/**********************************************
 * Configure attributes
 **********************************************/

// Update will be emitted to client only if another attribute has been updated
Model.ignoredAttrUpdate = ['updatedAt', 'accessToken', 'refreshToken', 'tokenExpiration', 'preferences'];

// Attribute hidden on when sending to client
Model.hiddenAttr = ['accessToken', 'refreshToken', 'tokenExpiration', 'preferences'];


/**********************************************
 * Model helpers
 **********************************************/

/**
 * Clean the given preferences object
 * @param {Object} preferences Input preferences object
 * @param {Team} team Team of the user on which you want to use thoses preferences
 * @return {Promise(Object)} Promise to the cleaned preferences object
 */
Model.cleanPreferences = function(preferences, userTeam) {
    return new Promise((resolve, reject) => {
        const notifications = preferences.notifications || {};
        let out = {
            notifications: {
                enable: (notifications.enable !== false),
                sound: (notifications.sound !== false),
                flash: (notifications.flash !== false),
                desktop: (notifications.desktop !== false),
                android: (notifications.android !== false),
                channels: {}, // [channel] = `hide`/`show`/`notify`
                alerts: {}, // [receiverTeamId] = `hide`/`notify`
            },
        };

        // Get group list to clean `notifications.alerts`
        Flux.Team.findAll()
        .then(teams => {
            const alerts = notifications.alerts || {};
            for (let team of teams) {
                if(team.id && team.can('ui/alertReceiver') && !out.notifications.alerts[team.id]) {
                    if(alerts[team.id] === 'notify' || alerts[team.id] === 'hide') {
                        out.notifications.alerts[team.id] = alerts[team.id];
                    }
                    else {
                        // Default: Only notify on user's group
                        if(team.id == userTeam.id) {
                            out.notifications.alerts[team.id] = 'notify';
                        }
                        else {
                            out.notifications.alerts[team.id] = 'hide';
                        }
                    }
                }
                // Add auto alert
                if(alerts[null] === 'notify' || alerts[null] === 'hide') {
                    out.notifications.alerts[null] = alerts[null];
                }
                else {
                    // Default: Only notify user that have explicit nullReceiver flag
                    if(userTeam.can('alert/nullReceiver')) {
                        out.notifications.alerts[null] = 'notify';
                    }
                    else {
                        out.notifications.alerts[null] = 'hide';
                    }
                }
            }

            // Get channels to clean `notifications.channels`
            return Flux.Message.getChannelList(userTeam);
        })
        .then(channelList => {
            const channels = notifications.channels || {};
            for (let channel of channelList) {
                if(channels[channel] === 'notify' || channels[channel] === 'show'
                    || channels[channel] === 'hide') {
                    out.notifications.channels[channel] = channels[channel];
                }
                else {
                    // Default: Only notify on user's channels
                    if(channel === 'public:'+Flux.Message.toChannel(userTeam.name)
                        || channel === 'group:'+Flux.Message.toChannel(userTeam.group)
                        || channel === 'private:'+Flux.Message.toChannel(userTeam.name)) {

                        out.notifications.channels[channel] = 'notify';
                    }
                    else {

                        out.notifications.channels[channel] = 'show';
                    }
                }
            }

            return resolve(out);
        })
        .catch(reject);
    });
}

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
Model.prototype.getItemGroups = function() {
    return ['id:' + this.id, 'all', 'team:'+this.teamId];
};

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
            return [true];
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
