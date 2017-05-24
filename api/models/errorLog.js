const Base = require('./Base');

function Model () {

    this.attributes = {
        ip : {
            type: 'string',
            required: true,
            ip: true,
        },

        user: {
            model: 'user',
        },

        message: {
            type: 'string',
        },

        error: {
            type: 'json',
        },

        details: {
            type: 'json',
        },

        stack: {
            type: 'string',
        },

        notificationStack: {
            type: 'string',
        },

    };

    // Attribute hidden on when sending to client
    this.hiddenAttr = [];

    // Update will be emitted to client only if another attribute has been updated
    this.ignoredAttrUpdate = [];

    this.fixtures = {};
}

// Inherit Base Model
Model.prototype = new Base('ErrorLog');

// Construct and export
module.exports = new Model();
