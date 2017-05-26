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
    });

    // Place where the barrel is currently
    Model.belongsTo(Flux.Team, {
        hooks: true,
    });
};
inheritBaseModel(Barrel);

/**********************************************
 * Model helpers
 **********************************************/


/**
 * Set the number of barrel for a type by generating or deleting some barrels.
 * @param {integer} typeId The id of the barrelType you want to update
 * @param {integer} count The number of barrels you want
 * @return Promise
 */
Barrel.setCount = function(typeId, count) {
    let toDelete = [];
    let toInsert = [];

    // Get current list of barrel
    return Barrel.findAll({ where: {
        barrelTypeId: typeId,
    }})
    .then(barrels => {
        // Insert if the barrel doesn't exists
        for (let i = 1; i <= parseInt(count); i++) {
            // Find in barrel list
            let found = false;
            for (let index in barrels) {
                if(barrels[index].num == i) {
                    found = true;
                    delete barrels[index];
                    break;
                }
            }

            // If not found, add to insert list
            if(!found) {
                toInsert.push({
                    barrelTypeId: typeId,
                    num: i,
                });
            }
        }

        // Add id of what's left to the delete list
        for (let barrel of barrels) {
            if(barrel) {
                toDelete.push(barrel.id);
            }
        }

        // Bulk Insert
        return Flux.Barrel.bulkCreate(toInsert);
    })
    .then(() => {

        // Bulk destroy
        return Flux.Barrel.destroy({ where: { id: toDelete }});
    });
};


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
 Model.getUserUpdateGroups = () => {
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
 Model.prototype.getReadGroups = function() {
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
