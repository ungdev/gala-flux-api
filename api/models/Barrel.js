const Sequelize = require('sequelize');
const Flux = require('../../Flux');
const inheritBaseModel = require('../../lib/BaseModel');

const Barrel = Flux.sequelize.define('barrel', {

    // number of barrels of this type
    num: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
        },
    },

    // the barrel's state :
    // new = not opened
    // opened = in use
    // empty
    state: {
        type: Sequelize.ENUM('new', 'opened', 'empty'),
        allowNull: false,
        defaultValue: 'new',
    },
});
const Model = Barrel;
Model.buildReferences = () => {
    // This function will be called once all models are initialized by Flux Object.
    Model.belongsTo(Flux.BarrelType, {
        hooks: true,
        as: 'type',
    });

    // Place where the barrel is currently
    Model.belongsTo(Flux.Team, {
        hooks: true,
    });
};
inheritBaseModel(Barrel);


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
 Model.getUserUpdateGroups = (team, user) => {
     let groups = [];
     if(team.can(Model.name + '/read') || team.can(Model.name + '/admin')) {
         return ['all'];
     }
     if(team.can(Model.name + '/restricted')) {
         groups.push('team:'+team.id);
     }
     return groups;
 };
 // Barrel are created by a special bulk endpoint, not by standard API
 Model.getUserCreateGroups = function(team, user) {
     return [];
 };
 Model.getUserDestroyGroups = () => {
     return [];
 };

 /**********************************************
  * Customize Item groups
  **********************************************/
 Model.prototype.getItemGroups = function() {
     let groups = ['all', 'team:'+this.teamId ];
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
        else if(split.length == 2 && split[0] == 'team') {
            filters.push({'teamId': split[1]});
        }
    }
    return filters;
};

module.exports = Model;
