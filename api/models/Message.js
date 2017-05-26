const Sequelize = require('sequelize');
const Flux = require('../../Flux');
const inheritBaseModel = require('../../lib/BaseModel');

const Message = Flux.sequelize.define('message', {

    text: {
        type: Sequelize.TEXT,
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },

    channel: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },
});
const Model = Message;
Model.buildReferences = () => {
    // This function will be called once all models are initialized by Flux Object.
    Model.belongsTo(Flux.User, {
        hooks: true,
    });
};
inheritBaseModel(Message);


/**********************************************
 * Model helpers
 **********************************************/

/**
 * Convert a string to channel name
 *
 * @param  {String} name Original name like team name or group name
 * @return {String} return channel name (without #)
 */
Model.toChannel = function(name) {
    return name.replace(':','-');
};




/**********************************************
 * Customize User groups
 **********************************************/
Model.getUserCreateGroups = function(team, user) {
    let groups = [];

    // Receive #group:[groupname] and #[teamname] but can send only in #[teamname]
    if(team.can('message/oneChannel')) {
        groups.push('channel:public:' + Flux.Message.toChannel(team.name));
    }
    // Send/read message to/from everywhere also private channels
    else if(team.can('message/admin')) {
        return ['all'];
    }
    // Not compatible with `oneChannel`. Can send and receive in any
    // public #[teamname] channel, can also receive and send in
    // its own #group:[groupname] channel
    else if(team.can('message/public')) {
        groups.push('category:public');
        groups.push('channel:group:' + Flux.Message.toChannel(team.group));

        // Can send and receive in any #group:[groupname] channel
        if(team.can('message/group')) {
            groups.push('category:group');
        }

        // Can send and receive in its own #private:[teamname] channel
        if(team.can('message/private')) {
            groups.push('channel:private:' + Flux.Message.toChannel(team.name));
        }
    }
    return groups;
};
Model.getUserReadGroups = (team, user) => {
    let groups = Model.getUserCreateGroups(team, user);

    // Receive #group:[groupname] and #[teamname] but can send only in #[teamname]
    if(team.can('message/oneChannel')) {
        groups.push('channel:group:' + Flux.Message.toChannel(team.group));
    }
    return groups;
};
Model.getUserUpdateGroups = () => {
    return [];
};
Model.getUserDestroyGroups = () => {
    return [];
};
/**********************************************
 * Customize Item groups
 **********************************************/
Model.prototype.getReadGroups = function() {
    let category = this.channel ? this.channel.split(':')[0] : undefined;
    return ['all', 'channel:'+this.channel, 'category:'+category ];
};
Model.prototype.getCreateGroups = Model.prototype.getReadGroups;
Model.prototype.getUpdateGroups = Model.prototype.getReadGroups;
Model.prototype.getDestroyGroups = Model.prototype.getReadGroups;

/**********************************************
 * Customize Filters
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
        // Can read only one channel
        else if(split.length == 2 && split[0] == 'channel') {
            filters.push({'channel': split[1]});
        }
        // Can read only one category of channel
        else if(split.length == 2 && split[0] == 'category') {
            filters.push({'channel': { $like: split[1]+':%'}});
        }
    }
    return filters;
};


module.exports = Model;
