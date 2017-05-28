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
        foreignKey: 'typeId',
    });
};
inheritBaseModel(BarrelType);


/**********************************************
 * Model helpers
 **********************************************/


/**
 * Set the number of barrel for a type by generating or deleting some barrels.
 * @param {integer} typeId The id of the barrelType you want to update
 * @param {integer} count The number of barrels you want
 * @return Promise
 */
BarrelType.prototype.setCount = function(count) {
    let toDelete = [];
    let toInsert = [];

    // Get current list of barrel
    return Flux.Barrel.findAll({ where: {
        typeId: this.id,
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
                    typeId: this.id,
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

module.exports = Model;
