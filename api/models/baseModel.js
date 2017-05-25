/**
 * Will add default methods and attributes to model before customisation
 */

function inheritBaseModel(Model) {

    // Attribute hidden on when sending to client
    Model.hiddenAttr = [];

    // Update will be emitted to client only if another attribute has been updated
    Model.ignoredAttrUpdate = [];

    // Fixture list to generate
    Model.fixtures = {};


    /**********************************************
     * User groups : Associate user to groups according to permissions
     * If item and user are in the same action group, then he can do the action
     *
     * Default:
     * [Model.name]/admin : can read/update all
     * [Model.name]/read : can read all
     **********************************************/
    Model.getUserReadGroups = function(team, user) {
        if(team.can(Model.name + '/read') || team.can(Model.name + '/admin')) {
            return ['all'];
        }
        return [];
    };
    Model.getUserCreateGroups = function(team, user) {
        if(team.can(Model.name + '/admin')) {
            return ['all'];
        }
        return [];
    };
    Model.getUserUpdateGroups = Model.getUserCreateGroups;
    Model.getUserDestroyGroups = Model.getUserCreateGroups;

    /**********************************************
     * Item group: Put item in a group according to values
     * If item and user are in the same action group, then he can do the action
     *
     * Default:
     * - all items are in the [action]:all group
     * - all items are in the [action]:id:[id] group
     **********************************************/
    Model.prototype.getReadGroups = function() {
        return ['id:' + this.id, 'all'];
    };
    Model.prototype.getCreateGroups = Model.prototype.getReadGroups;
    Model.prototype.getUpdateGroups = Model.prototype.getReadGroups;
    Model.prototype.getDestroyGroups = Model.prototype.getReadGroups;

    /**********************************************
     * Filters: Filter of the find action append to filters that user specify
     *
     * Default: Handle read:all and read:id:[id]
     **********************************************/
    Model.getReadFilters = function(team, user) {
        let filters = [];
        let groups = this.getUserReadGroups(team, user);
        for (let group of groups) {
            let split = group.split(':');
            // Can read all
            if(group == 'all') {
                return [{true: true}];
            }
            // Can read only one id
            else if(split.length == 2 && split[0] == 'id') {
                filters.push({'id': split[1]});
            }
        }
        return filters;
    };

    // /**
    //  * Before removing an item from the database
    //  *
    //  * @param {object} criteria contains the query with the user id
    //  * @param {function} cb the callback
    //  */
    // this.beforeDestroy = function(criteria, cb) {
    //     global[this._Model.tableName].find(criteria).exec((error, items) => {
    //         // Publish destroy event
    //         for (let item of items) {
    //             this._publishDestroy(item.id);
    //         }
    //     });
    // };
    //
    // /**
    //  * Publish destory to client.
    //  *
    //  * @param {id} id id of the destroyed element
    //  */
    // this._publishDestroy = function(id) {
    //     global[this._Model.tableName].publishDestroy(id);
    // }
    //
    //
    // /**
    //  * After creating an item
    //  *
    //  * @param {object} newlyInsertedRecord New item
    //  * @param {function} cb the callback
    //  */
    // this.afterCreate = function(newlyInsertedRecord, cb) {
    //     // Remove hidden attrs from element
    //     for (let attr of User.hiddenAttr) {
    //         delete newlyInsertedRecord[attr];
    //     }
    //
    //     // Publish
    //     global[this._Model.tableName]._publishCreate(newlyInsertedRecord);
    //
    //     return cb();
    // };
    //
    // /**
    //  * Publish create to client.
    //  *
    //  * @param {object} newlyInsertedRecord New item
    //  */
    // this._publishCreate = function(newlyInsertedRecord) {
    //     global[this._Model.tableName].publishCreate(newlyInsertedRecord);
    // };
    //
    //
    // /**
    //  * Before updating an item
    //  *
    //  * @param {object} valuesToUpdate Values to update
    //  * @param {function} cb the callback
    //  */
    // this.beforeUpdate = function(valuesToUpdate, cb) {
    //     global[this._Model.tableName].findOne({id: valuesToUpdate.id}).exec((error, currentRecord) => {
    //         // Ignore change of some fields to avoid flood
    //         let publish = false;
    //         let keys = [...new Set([...Object.keys(valuesToUpdate), ...Object.keys(currentRecord)])];
    //         for (let attr of keys) {
    //             if(User.ignoredAttrUpdate.indexOf(attr) === -1 && valuesToUpdate[attr] != currentRecord[attr]) {
    //                 // Additionnal step to compare date objects
    //                 if(!(valuesToUpdate[attr] instanceof Date) || !(currentRecord[attr] instanceof Date) || valuesToUpdate[attr].getTime() !== currentRecord[attr].getTime()) {
    //                     publish = true;
    //                     break;
    //                 }
    //             }
    //         }
    //
    //         // Publish if necessary
    //         if(publish) {
    //             let publishValue = Object.assign({}, currentRecord, valuesToUpdate);
    //             // Remove hidden attrs from element
    //             for (let attr of User.hiddenAttr) {
    //                 delete publishValue[attr];
    //             }
    //             global[this._Model.tableName]._publishUpdate(publishValue.id, publishValue, currentRecord);
    //         }
    //
    //         return cb();
    //     });
    // };
    //
    // /**
    //  * Publish update to client.
    //  *
    //  * @param {id} id Id to update
    //  * @param {object} valuesToUpdate Values to update
    //  * @param {object} currentRecord Current value
    //  */
    // this._publishUpdate = function(id, valuesToUpdate, currentRecord) {
    //     global[this._Model.tableName].publishUpdate(valuesToUpdate.id, valuesToUpdate);
    // }
    //
    //
    // /**
    //  * Our update hook needs to have the item id. But if we do something like
    //  * ```
    //  * Message.update({sender: user.id}, {sender: null}).exec()
    //  * ```
    //  * It get only {sender: null} which is not enough. So this method replace the classic update method.
    //  * Warning: This function emulate original method behavior with .exec() at the end. But don't try to use something else.
    //  * @param {object} filter filter
    //  * @param {object} update Attributes to update
    //  */
    // this.update2 = function(filter, update) {
    //     return {
    //         exec: (cb) => {
    //             global[this._Model.tableName].find(filter).exec((error, items) => {
    //                 if(error) return cb(error);
    //
    //                 for (let item of items) {
    //                     for (let attr in update) {
    //                         item[attr] = update[item];
    //                     }
    //                     item.save();
    //                 }
    //
    //                 return cb();
    //             });
    //         }
    //     };
    // };
    //
    // /**
    //  * Waterline doen't check foreign key
    //  * this function will check foreign key and will return null or sails.js error format
    //  *  with an E_VALIDATION flag (same as waterline validation error) and the rule 'model'
    //  *
    //  * @param  {string} attr Name of the forign key
    //  * @param  {object|id} value Object to validate or directly value of the attr
    //  * @return {Promise} The found foreign value/null or will error to validation object that you can return with badRequest
    //  */
    // this.validateForeignKey = function(attr, value) {
    //     return new Promise((resolve, reject) => {
    //         // Convert value to id if necessary
    //         if(typeof value !== 'string') {
    //             value = value[attr];
    //         }
    //
    //         // If it's a foreign key and not empty (required rule will throw error if necessary for this)
    //         if(this.attributes[attr].model && value) {
    //             sails.models[this.attributes[attr].model].findOneById(value).exec((error, found) => {
    //                 if(error || !found) {
    //                     let rtn = {
    //                         code: 'E_VALIDATION',
    //                         message: 'Foreign key validation error',
    //                         invalidAttributes: {},
    //                     };
    //                     rtn.invalidAttributes[attr] = [];
    //                     rtn.invalidAttributes[attr].push({
    //                         rule: 'model',
    //                         message: 'Foreign item not found',
    //                     });
    //                     return reject(rtn);
    //                 }
    //                 return resolve(found);
    //             });
    //         }
    //         else {
    //             return resolve(null);
    //         }
    //     });
    // };
}

module.exports = inheritBaseModel;
