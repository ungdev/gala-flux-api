const Sequelize = require('sequelize');
const Flux = require('../../Flux');
const inheritBaseModel = require('../../lib/BaseModel');

const BottleType = Flux.sequelize.define('bottleType', {

    name: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },

    shortName: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
            len: [1,3],
        },
    },

    quantityPerBox: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
        },
    },

    /**
     * Sell price of a bottle
     */
    sellPrice: {
        type: Sequelize.FLOAT,
        allowNull: false,
    },

    /**
     * Supplier price of a bottle
     */
    supplierPrice: {
        type: Sequelize.FLOAT,
        allowNull: false,
    },


    /**
     * Number of bottle
     */
    originalStock: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },


});
const Model = BottleType;
Model.buildReferences = () => {
    // This function will be called once all models are initialized by Flux Object.
    Model.hasMany(Flux.BottleAction, {
        hooks: true,
        foreignKey: 'typeId',
    });
};
inheritBaseModel(BottleType);


module.exports = Model;
