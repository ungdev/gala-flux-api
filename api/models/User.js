const Sequelize = require('sequelize');
const Flux = require('../../Flux');
const inheritBaseModel = require('../../lib/BaseModel');

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
Model.ignoredAttrUpdate = ['updatedAt', 'accessToken', 'refreshToken', 'tokenExpiration'];

// Attribute hidden on when sending to client
Model.hiddenAttr = ['accessToken', 'refreshToken', 'tokenExpiration'];

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
