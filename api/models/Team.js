const Sequelize = require('sequelize');
const Flux = require('../../Flux');
const inheritBaseModel = require('../../lib/BaseModel');

const Team = Flux.sequelize.define('team', {

    name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true,
        }
    },

    group: {
        type: Sequelize.STRING,
        allowNull: false,
    },

    location: {
        type: Sequelize.STRING,
    },

    role: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            roleExist(value) {
                if(!Object.keys(Flux.config.roles).includes(value)) {
                    throw new Error('Validation roleExist failed');
                }
            },
            notEmpty: true,
        }
    },
});
const Model = Team;
Model.buildReferences = () => {
    // This function will be called once all models are initialized by Flux Object.
    Model.hasMany(Flux.User, {
        hooks: true,
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    });
};
inheritBaseModel(Team);

/**********************************************
 * Model helpers
 **********************************************/

/**
 * Check team permission
 * @param {string} permission Permission name
 * @return true if the team has the given permission
 */
Team.prototype.can = function(permission) {
    return (Array.isArray(Flux.config.roles[this.role]) && Flux.config.roles[this.role].indexOf(permission) !== -1);
};

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

    return groups;
};


module.exports = Model;
