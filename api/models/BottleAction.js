/**
 * BottleAction.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

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
      bottleId : {
          model: "BottleType",
      },

      quantity : {
          type: 'integer',
          required: true,
          defaultsTo: '1',
      },

      operation : {
          type: 'string',
          enum: ['purchased', 'moved'],
      },

  },

};
