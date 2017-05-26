const Flux = require('../Flux');

/**
 * Will add default methods and attributes to model before customisation
 */

function inheritBaseModel(Model) {

    // Attribute hidden on when sending to client
    Model.hiddenAttr = [];

    // Update will be emitted to client only if another attribute has been updated
    Model.ignoredAttrUpdate = ['updatedAt'];

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
                return [true];
            }
            // Can read only one id
            else if(split.length == 2 && split[0] == 'id') {
                filters.push({'id': split[1]});
            }
        }
        return filters;
    };


    /**********************************************
     * Lifecycle hook
     * - Send event to sockets that subscribed to this model and can read it
     **********************************************/
    let afterHookMacro = function(verb) {
        return (instance, options) => {
            if(Flux.io) {
                // Send only if field is not ignored
                if(verb == 'updated') {
                    let changed = false;
                    for (let attr of Object.keys(Model.attributes)) {
                        if(instance.changed(attr) && !Model.ignoredAttrUpdate.includes(attr)) {
                            changed = true;
                            break;
                        }
                    }
                    if(!changed) {
                        return;
                    }
                }

                // Send event
                let rooms = instance.getReadGroups().map(room => ('model:' + Model.name + ':' + room));
                Flux.debug('Emit '+verb+' for ' + Model.name + ' id:' + instance.id + ' to', 'model:' + Model.name, rooms);
                for (let room of rooms) {
                    Flux.io.to(room).emit('model:' + Model.name, {
                        verb: verb,
                        id: instance.id,
                        data: instance,
                    });
                }
            }
        };
    };
    Model.afterCreate(afterHookMacro('created'));
    Model.afterUpdate(afterHookMacro('updated'));
    Model.afterDestroy(afterHookMacro('destroyed'));

    /**********************************************
     * Bulk hooks
     * - This will tell sequelize to trigger normal
     * lifecycle hooks even if it's a bulk action
     **********************************************/
    Model.beforeBulkCreate((instances, options) => {
        options.individualHooks = true;
    });
    Model.beforeBulkDestroy((options) => {
        options.individualHooks = true;
    });
    Model.beforeBulkUpdate((options) => {
        options.individualHooks = true;
    });

    Model.prototype._toJSON = Model.prototype.toJSON;
    Model.prototype.toJSON = function() {
        let values = this.get({plain: true});

        // Remove hidden attributes and key not defined in model
        let publicAttrs = Object.keys(Model.attributes);
        publicAttrs = publicAttrs.filter(attr => !Model.hiddenAttr.includes(attr));
        for (let attr of Object.keys(values)) {
            if(!publicAttrs.includes(attr)) {
                delete values[attr];
            }
        }
        return values;
    }
}

module.exports = inheritBaseModel;
