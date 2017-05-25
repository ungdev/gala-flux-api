const Sequelize = require('sequelize');
const Flux = require('../../Flux');

const Session = Flux.sequelize.define('session', {

    deviceId: {
        type: Sequelize.STRING,
        unique: true,
    },

    firebaseToken: {
        type: Sequelize.STRING,
        unique: true,
    },

    socketId: {
        type: Sequelize.STRING,
        unique: true,
    },

    ip: {
        type: Sequelize.STRING,
        validate: {
            isIP: true,
        },
    },

    lastAction: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false,
    },

    connectionLost: {
        type: Sequelize.DATE,
    },
});


/**
 * This function will be called once all models are initialized by Flux Object.
 */
Session.buildReferences = () => {
    Session.belongsTo(Flux.User, {
        foreignKey: { allowNull: false },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    });
};



/**********************************************
 * User groups
 **********************************************/
Session.getUserReadGroups = function(team, user) {
    let groups = [];

    // If you have the right to read all
    if(team.can('sessio/read') || team.can('sessio/admin')) {
        groups.push('read:all');
    }

    return groups;
};
Session.getUserCreateGroups = function(team, user) {
    return [];
};
Session.getUserUpdateGroups = function(team, user) {
    return [];
};
Session.getUserDestroyGroups = function(team, user) {
    return [];
};

/**********************************************
 * Filters
 **********************************************/
Session.getFilters = function(team, user) {
    let filters = [];
    let groups = this.getUserReadGroups(team, user);
    for (let group of groups) {
        let split = group.split(':');
        // Can read all
        if(group == 'read:all') {
            filters.push(true);
            return filters;
        }
        // Can read only one id
        else if(split[0] == 'read' && split[1] == 'id') {
            filters.push({'id': split[2]});
        }
    }
    return filters;
};

/**********************************************
 * Item group
 **********************************************/
Session.prototype.getReadGroups = function() {
    return ['read:all'];
};
Session.prototype.getCreateGroups = function() {
    return ['create:all'];
};
Session.prototype.getUpdateGroups = function() {
    return ['update:all'];
};
Session.prototype.getDestroyGroups = function() {
    return ['destroy:all'];
};

module.exports = Session;


/*
module.exports = {


    // Override the default toJSON method
    toJSON: function() {
        let obj = this.toObject();

        delete obj.socketId;
        delete obj.firebaseToken;
        delete obj.androidId;

        return obj;
    },

    // Attribute hidden on when sending to client
    hiddenAttr: ['firebaseToken', 'androidId', 'socketId'],

    // Update will be emitted to client only if another attribute has been updated
    ignoredAttrUpdate: ['firebaseToken', 'androidId', 'socketId', 'createdAt', 'user'],

    /**
     * When a socket is closed or a user clicked on the logout button, update the session
     * @param {string} socketId
     * @param {boolean} requested if the logout is requested by user, we can even delete android sessions
     * @return {boolean} update success
     *
    handleLogout: function(socketId, requested) {

        // get the session with this socket id
        Session.findOne({socketId}).exec((err, session) => {
            if (err) return err;

            // session already destroyed (disconnected and then close the browser tab for example)
            if (!session) return null;

            // if the session has a firebase token, update the disconnectedAt value
            if (session.firebaseToken && !requested) {
                session.disconnectedAt = Date.now();
                session.save(err => {
                    if (err) return err;

                    callCheckTeamActivity(session.user);
                    return null;
                });
            } else {
                // the device doesn't have a firebase token, so delete the session because this one will not be opened again
                Session.destroy({id: session.id}).exec(err => {
                    if (err) return err;

                    callCheckTeamActivity(session.user);
                    return null;
                });
            }
        });
    }

};

function callCheckTeamActivity(userId) {
    User.findOne({id: userId}).exec((err, user) => {
        if (!err && user) {
            AlertService.checkTeamActivity(user.team);
        }
    });
}
*/
