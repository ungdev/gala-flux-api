/**
 * Base
 * @description All model should inherit from this model. It implement base features based on hooks.
 */
const faker = require('faker');

function BaseModel (model) {

    this._modelName = model;

    // Attribute hidden on when sending to client
    this.hiddenAttr = [];

    // Update will be emitted to client only if another attribute has been updated
    this.ignoredAttrUpdate = [];

    this.fixtures = {};

    /**
     * Before removing an item from the database
     *
     * @param {object} criteria contains the query with the user id
     * @param {function} cb the callback
     */
    this.beforeDestroy = function(criteria, cb) {
        global[this._modelName].find(criteria).exec((error, items) => {
            // Publish destroy event
            for (let item of items) {
                this._publishDestroy(item.id);
            }
        });
    };

    /**
     * Publish destory to client.
     *
     * @param {id} id id of the destroyed element
     */
    this._publishDestroy = function(id) {
        global[this._modelName].publishDestroy(id);
    }


    /**
     * After creating an item
     *
     * @param {object} newlyInsertedRecord New item
     * @param {function} cb the callback
     */
    this.afterCreate = function(newlyInsertedRecord, cb) {
        // Remove hidden attrs from element
        for (let attr of User.hiddenAttr) {
            delete newlyInsertedRecord[attr];
        }

        // Publish
        global[this._modelName]._publishCreate(newlyInsertedRecord);

        return cb();
    };

    /**
     * Publish create to client.
     *
     * @param {object} newlyInsertedRecord New item
     */
    this._publishCreate = function(newlyInsertedRecord) {
        global[this._modelName].publishCreate(newlyInsertedRecord);
    };


    /**
     * Before updating an item
     *
     * @param {object} valuesToUpdate Values to update
     * @param {function} cb the callback
     */
    this.beforeUpdate = function(valuesToUpdate, cb) {
        global[this._modelName].findOne({id: valuesToUpdate.id}).exec((error, currentRecord) => {
            // Ignore change of some fields to avoid flood
            let publish = false;
            let keys = [...new Set([...Object.keys(valuesToUpdate), ...Object.keys(currentRecord)])];
            for (let attr of keys) {
                if(User.ignoredAttrUpdate.indexOf(attr) === -1 && valuesToUpdate[attr] != currentRecord[attr]) {
                    // Additionnal step to compare date objects
                    if(!(valuesToUpdate[attr] instanceof Date) || !(currentRecord[attr] instanceof Date) || valuesToUpdate[attr].getTime() !== currentRecord[attr].getTime()) {
                        publish = true;
                        break;
                    }
                }
            }

            // Publish if necessary
            if(publish) {
                let publishValue = Object.assign({}, currentRecord, valuesToUpdate);
                // Remove hidden attrs from element
                for (let attr of User.hiddenAttr) {
                    delete publishValue[attr];
                }
                global[this._modelName]._publishUpdate(publishValue.id, publishValue, currentRecord);
            }

            return cb();
        });
    };

    /**
     * Publish update to client.
     *
     * @param {id} id Id to update
     * @param {object} valuesToUpdate Values to update
     * @param {object} currentRecord Current value
     */
    this._publishUpdate = function(id, valuesToUpdate, currentRecord) {
        global[this._modelName].publishUpdate(valuesToUpdate.id, valuesToUpdate);
    }


    /**
     * Our update hook needs to have the item id. But if we do something like
     * ```
     * Message.update({sender: user.id}, {sender: null}).exec()
     * ```
     * It get only {sender: null} which is not enough. So this method replace the classic update method.
     * Warning: This function emulate original method behavior with .exec() at the end. But don't try to use something else.
     * @param {object} filter filter
     * @param {object} update Attributes to update
     */
    this.update2 = function(filter, update) {
        return {
            exec: (cb) => {
                global[this._modelName].find(filter).exec((error, items) => {
                    if(error) return cb(error);

                    for (let item of items) {
                        for (let attr in update) {
                            item[attr] = update[item];
                        }
                        item.save();
                    }

                    return cb();
                });
            }
        };
    };

    /**
     * Waterline doen't check foreign key
     * this function will check foreign key and will return null or sails.js error format
     *  with an E_VALIDATION flag (same as waterline validation error) and the rule 'model'
     *
     * @param  {string} attr Name of the forign key
     * @param  {object|id} value Object to validate or directly value of the attr
     * @return {Promise} The found foreign value/null or will error to validation object that you can return with badRequest
     */
    this.validateForeignKey = function(attr, value) {
        return new Promise((resolve, reject) => {
            // Convert value to id if necessary
            if(typeof value !== 'string') {
                value = value[attr];
            }

            // If it's a foreign key and not empty (required rule will throw error if necessary for this)
            if(this.attributes[attr].model && value) {
                sails.models[this.attributes[attr].model].findOneById(value).exec((error, found) => {
                    if(error || !found) {
                        let rtn = {
                            code: 'E_VALIDATION',
                            message: 'Foreign key validation error',
                            invalidAttributes: {},
                        };
                        rtn.invalidAttributes[attr] = [];
                        rtn.invalidAttributes[attr].push({
                            rule: 'model',
                            message: 'Foreign item not found',
                        });
                        return reject(rtn);
                    }
                    return resolve(found);
                });
            }
            else {
                return resolve(null);
            }
        });
    };
}

module.exports = BaseModel;
