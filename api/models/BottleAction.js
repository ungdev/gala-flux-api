const Base = require('./Base');

function Model () {

    this.attributes = {

        /**
        * Can be null if team deleted
        */
        team : {
            model: 'team',
        },

        /**
        * Can be null if team deleted
        */
        fromTeam : {
            model: 'team',
        },

        /**
        * Can be null if BottleType deleted
        */
        type : {
            model: "BottleType",
        },

        quantity : {
            type: 'integer',
            required: true,
        },

        operation : {
            type: 'string',
            enum: ['purchased', 'moved'],
            required: true,
        },

    };

    // Attribute hidden on when sending to client
    this.hiddenAttr = [];

    // Update will be emitted to client only if another attribute has been updated
    this.ignoredAttrUpdate = [];




    /**
     * Publish create to client.
     *
     * @param {object} newlyInsertedRecord New item
     */
    this._publishCreate = function(newlyInsertedRecord) {
        // Publish
        let data = {
            verb: 'created',
            id: newlyInsertedRecord.id,
            data: newlyInsertedRecord,
        };
        sails.sockets.broadcast('bottleAction/' + newlyInsertedRecord.team, 'bottleaction', data);
        sails.sockets.broadcast('bottleAction/' + newlyInsertedRecord.fromTeam, 'bottleaction', data);
        BottleAction.publishCreate(newlyInsertedRecord);
    };



    /**
     * Publish update to client.
     *
     * @param {id} id Id to update
     * @param {object} valuesToUpdate Values to update
     */
    this._publishUpdate = function(id, valuesToUpdate) {
        let data = {
            verb: 'updated',
            id: valuesToUpdate.id,
            data: valuesToUpdate,
        };
        sails.sockets.broadcast('bottleAction/' + valuesToUpdate.team, 'bottleaction', data);
        sails.sockets.broadcast('bottleAction/' + valuesToUpdate.fromTeam, 'bottleaction', data);
        BottleAction.publishUpdate(valuesToUpdate.id, valuesToUpdate);
    };


    /**
     * Before removing an item from the database
     *
     * @param {object} criteria contains the query with the user id
     * @param {function} cb the callback
     */
    this.beforeDestroy = function(criteria, cb) {
        let error = new Error("It's forbidden to destroy an item of this model.");
        sails.log.error(error);
        return cb(error);
    };


}

// Inherit Base Model
Model.prototype = new Base('BottleAction');

// Construct and export
module.exports = new Model();
