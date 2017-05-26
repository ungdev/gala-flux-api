const Sequelize = require('sequelize');
const Flux = require('../../Flux');
const inheritBaseModel = require('../../lib/BaseModel');

const BarrelLog = Flux.sequelize.define('barrelLog', {

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
const Model = BarrelLog;
Model.buildReferences = () => {
    // This function will be called once all models are initialized by Flux Object.
    Model.belongsTo(Flux.BarrelType, {
        hooks: true,
    });
    // Place where the barrel is currently
    Model.belongsTo(Flux.Team, {
        hooks: true,
    });

    Model.belongsTo(Flux.Barrel, {
        hooks: true,
    });
};
inheritBaseModel(BarrelLog);
