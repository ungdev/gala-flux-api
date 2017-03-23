/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {

        text : {
            type: 'mediumtext',
            required: true,
        },

        sender: {
            model: 'user',
            required: true,
        },

        recipient: {
            model: 'user',
            defaultsTo: null,
        },

        group: {
            type: 'string',
            defaultsTo: null,
        },

        private: {
            type: 'boolean',
            defaultsTo: false,
        },
    },

    // TODO
    // publishCreate: function (values, req, options) {
    //
    //     User.publish(values.recipient, {
    //         verb: "created",
    //         data: values,
    //         id: values.id
    //     }, req);
    // },
};
