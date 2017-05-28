const Sequelize = require('sequelize');
const Flux = require('../../Flux');
const inheritBaseModel = require('../../lib/BaseModel');

const BottleAction = Flux.sequelize.define('bottleAction', {

    quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
            notIn: [[0]],
        },
    },

    operation: {
        type: Sequelize.ENUM('purchased', 'moved'),
        allowNull: false,
    },
});
const Model = BottleAction;
Model.buildReferences = () => {
    // This function will be called once all models are initialized by Flux Object.
    Model.belongsTo(Flux.Team, {
        hooks: true,
    });
    Model.belongsTo(Flux.Team, {
        hooks: true,
        as: 'fromTeam',
    });
    Model.belongsTo(Flux.BottleType, {
        hooks: true,
        as: 'type',
    });
};
inheritBaseModel(BottleAction);



/**********************************************
 * Customize User groups
 **********************************************/
Model.getUserReadGroups = function(team, user) {
    let groups = [];
    if(team.can(Model.name + '/read') || team.can(Model.name + '/admin')) {
        return ['all'];
    }
    if(team.can(Model.name + '/restricted')) {
        groups.push('team:'+team.id);
    }
    return groups;
};
Model.getUserCreateGroups = function(team, user) {
    let groups = [];
    if(team.can(Model.name + '/admin')) {
        return ['all'];
    }
    if(team.can(Model.name + '/restricted')) {
        groups.push('purchasedTeam:'+team.id);
    }
    return groups;
};
Model.getUserUpdateGroups = () => {
    return [];
};
Model.getUserDestroyGroups = () => {
    return [];
};

/**********************************************
 * Customize Item groups
 **********************************************/
Model.prototype.getItemGroups = function() {
    let groups = ['all', 'team:'+this.fromTeamId, 'team:'+this.teamId ];
    if(this.operation == 'purchased') {
        groups.push('purchasedTeam:'+this.fromTeamId);
        groups.push('purchasedTeam:'+this.teamId);
    }
    return groups;
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
        // Can read only what's Associate with one team
        else if(split.length == 2 && split[0] == 'purchasedTeam') {
            filters.push({'teamId': split[1], operation: 'purchased'});
            filters.push({'fromTeamId': split[1], operation: 'purchased'});
        }
        else if(split.length == 2 && split[0] == 'team') {
            filters.push({'teamId': split[1]});
            filters.push({'fromTeamId': split[1]});
        }
    }
    return filters;
};


module.exports = Model;
