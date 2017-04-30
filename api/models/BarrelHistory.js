const Base = require('./Base');

function Model () {

    this.attributes = {

        /**
         * Can be null if barrel deleted
         */
        barrelId: {
            model: "barrel",
        },

        /**
         * Can be null if barreltype deleted
         */
        type: {
            model: "barreltype",
        },

        reference: {
            type: "string",
            required: true,
        },

        /**
         * null if not allocated to a bar (a team) or team deleted. Else, the team.
         */
        place: {
            model: "team",
            defaultsTo: null
        },

        state: {
            type: "string",
            enum: ["new", "opened", "empty"],
            required: true
        }

    };

    // Attribute hidden on when sending to client
    this.hiddenAttr = [];

    // Update will be emitted to client only if another attribute has been updated
    this.ignoredAttrUpdate = [];


    /**
     * Will a barrel state to the history
     *
     * @param  {Barrel|Array} barrel   Can be a single object or an array of object for bulk operations
     * @param  {type} callback description
     * @return {type}          description
     */
    this.pushToHistory = function(barrel, callback) {
        let data = [];
        if(Array.isArray(barrel)) {
            for (let item of barrel) {
                data.push({
                    barrelId: item.id,
                    type: item.type,
                    reference: item.reference,
                    place: item.place,
                    state: item.state
                });
            }
        }
        else {
            data = {
                barrelId: barrel.id,
                type: barrel.type,
                reference: barrel.reference,
                place: barrel.place,
                state: barrel.state
            };
        }

        BarrelHistory.create(data).exec((error, barrelHistory) => {
            callback(error, barrelHistory);
        });

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
Model.prototype = new Base('BarrelHistory');

// Construct and export
module.exports = new Model();
