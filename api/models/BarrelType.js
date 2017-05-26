const Sequelize = require('sequelize');
const Flux = require('../../Flux');
const inheritBaseModel = require('../../lib/BaseModel');

const BarrelType = Flux.sequelize.define('barrelType', {

    // full name of the barrel's content (example: Chouffe)
    name: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },

    // short name of the barrel's content (example: CH)
    shortName: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
            len: [1,3],
        },
    },

    // quantity in liters of the barrel (example: 25)
    liters: {
        type: Sequelize.FLOAT,
        allowNull: false,
    },

    // price of a barrel at which it must be sold
    sellPrice: {
        type: Sequelize.FLOAT,
        allowNull: false,
    },

    // Supplier price of the barrel
    supplierPrice: {
        type: Sequelize.FLOAT,
        allowNull: false,
    },

});
const Model = BarrelType;
Model.buildReferences = () => {
    // This function will be called once all models are initialized by Flux Object.
    Model.hasMany(Flux.Barrel, {
        hooks: true,
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    });
};
inheritBaseModel(BarrelType);

module.exports = Model;
