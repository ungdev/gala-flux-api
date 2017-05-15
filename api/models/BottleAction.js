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



    /**
     * This function will emit alert if necessary
     * @param {id} teamId the team to check
     * @param {BottleType} type type of the bottle to test
     */
    this.checkForAlert = function(teamId, type) {
        if(teamId) {
            BottleAction.find([{ team: teamId }, { fromTeam: teamId }])
            .exec((error, bottleActions) => {
                let newCount = 0;
                let emptyCount = 0;
                // Calculate number of bottle left
                for (let bottleAction of bottleActions) {
                    if(bottleAction.type == type.id) {
                        if(bottleAction.operation == 'purchased' && bottleAction.team == teamId) {
                            newCount -= bottleAction.quantity;
                            emptyCount += bottleAction.quantity;
                        }
                        else if(bottleAction.operation == 'moved') {
                            if(bottleAction.fromTeam == teamId) newCount -= bottleAction.quantity;
                            if(bottleAction.team == teamId) newCount += bottleAction.quantity;
                        }
                    }
                }

                // Before emitting a new alert remove old one about this bottle
                Alert.destroy({
                    title: 'Bouteilles : ' + type.name + ' (' + type.shortName + ')',
                    severity: ['warning', 'serious'],
                    category: 'Manque auto',
                    sender: teamId,
                })
                .exec((error) => {
                    if (error) return;

                    // if less than
                    if (newCount <= 13 && newCount < emptyCount) {
                        Alert.create({
                            sender: teamId,
                            severity: newCount >= 7 ? 'warning' : 'serious',
                            title: 'Bouteilles : ' + type.name + ' (' + type.shortName + ')',
                            message: ' Plus que ' + newCount + ' bouteille' + (newCount>1?'s':'') + ' à '+ (new Date).getHours() + ':' +  (new Date).getMinutes(),
                            category: 'Manque auto',
                        })
                        .exec((error, alert) => {
                            if (error) return;

                            // push this modification in the alert history
                            AlertHistory.pushToHistory(alert, (error, result) => {
                                if (error) return;
                            });

                        });
                    }
                });
            });
        }
    };
}

// Inherit Base Model
Model.prototype = new Base('BottleAction');

// Construct and export
module.exports = new Model();
