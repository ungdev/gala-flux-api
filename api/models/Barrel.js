/**
 * Barrel.js
 *
 * @description :: Represents a physical barrel (The Chouffe barrel number 2 for example).
 * A barrel is linked to a BarrelType.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {

        // the barrel's type
        type: {
            model: "barreltype",
            required: true
        },

        // unique reference : type's shortName + (number of barrels of this type + 1)
        reference: {
            type: "string",
            required: true,
            unique: true
        },

        // (number of barrels of this type + 1)
        num: {
            type: "integer",
            required: true
        },

        // null if not allocated to a bar (a team). Else, the team.
        place: {
            model: "team",
            defaultsTo: null
        },

        // the barrel's state :
        // new = not opened
        // opened = in use
        // empty
        state: {
            type: "string",
            enum: ["new", "opened", "empty"],
            required: true,
            defaultsTo: "new"
        }

    }

};

