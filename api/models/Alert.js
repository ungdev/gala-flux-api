const Sequelize = require('sequelize');
const Flux = require('../../Flux');
const inheritBaseModel = require('../../lib/BaseModel');

const Alert = Flux.sequelize.define('alert', {

    title: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },

    // alert degree :
    // warning      => 1st level
    // serious      => 2nd level
    // done         => closed alert
    severity: {
        type:   Sequelize.ENUM('done', 'warning', 'serious'),
        allowNull: false,
    },

    // if the user wrote a message when he created the alert
    message: {
        type: Sequelize.STRING,
    },

    // users on this alert
    users: {
        type: Sequelize.TEXT,
        get: function () {
            let value = this.getDataValue('users');
            if(!value) return [];
            return JSON.parse(value);
        },
        set: function (value) {
            this.setDataValue('users', JSON.stringify(value));
        },
    }

});
const Model = Alert;
Model.buildReferences = () => {
    // This function will be called once all models are initialized by Flux Object.
    Model.belongsTo(Flux.Team, {
        hooks: true,
        as: 'senderTeam',

    });
    Model.belongsTo(Flux.Team, {
        hooks: true,
        as: 'receiverTeam',
    });
    Model.belongsTo(Flux.AlertButton, {
        hooks: true,
        as: 'button',
    });
};
inheritBaseModel(Alert);

/**********************************************
 * Customize User groups
 **********************************************/
Model.getUserReadGroups = function(team, user) {
    let groups = [];
    if(team.can(Model.name + '/read') || team.can(Model.name + '/admin')) {
        return ['all'];
    }
    if(team.can(Model.name + '/restrictedSender')) {
        groups.push('senderTeam:'+team.id);
    }
    if(team.can(Model.name + '/restrictedReceiver')) {
        groups.push('receiverTeam:'+team.id);
    }
    if(team.can(Model.name + '/nullReceiver')) {
        groups.push('receiverTeam:null');
    }
    return groups;
};
Model.getUserUpdateGroups = Model.getUserReadGroups;
Model.getUserCreateGroups = (team, user) => {
    let groups = [];
    if(team.can(Model.name + '/admin')) {
        return ['all'];
    }
    if(team.can(Model.name + '/restrictedSender')) {
        groups.push('senderTeam:'+team.id);
    }
    return groups;
};
Model.getUserDestroyGroups = (team, user) => {
    return [];
};

/**********************************************
 * Customize Item groups
 **********************************************/
Model.prototype.getItemGroups = function() {
    return ['all', 'senderTeam:'+this.senderTeamId, 'receiverTeam:'+(this.receiverTeamId || 'null') ];
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
        else if(split.length == 2 && split[0] == 'senderTeam') {
            filters.push({'senderTeamId': split[1]});
        }
        else if(split.length == 2 && split[0] == 'receiverTeam') {
            filters.push({'receiverTeamId': split[1]});
        }
        else if(group == 'receiverTeam:null') {
            filters.push({'receiverTeamId': null});
        }
    }
    return filters;
};


module.exports = Model;
