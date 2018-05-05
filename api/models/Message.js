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

/**
 * Get channel list available for a specified team
 * @param {Team} team The team
 * @return {Promise(array)} The promise to an array of channel name as string
 */
Model.getChannelList = function(team) {
    return new Promise((resolve, reject) => {
        let list = new Set();
        // Receive #group:[groupname] and #[teamname] but can send only in #[teamname]
        if(team.can('message/oneChannel')) {
            list.add('public:'+Flux.Message.toChannel(team.name));
            list.add('group:'+Flux.Message.toChannel(team.group));
            return resolve([...list]);
        }
        else if(team.can('message/admin') || team.can('message/public')) {
            list.add('public:General');
            Flux.Team.findAll()
            .then(teams => {
                // Public
                for (let team of teams) {
                    list.add('public:'+Flux.Message.toChannel(team.name));
                }

                // Group
                if(team.can('message/group') || team.can('message/admin')) {
                    for (let team of teams) {
                        if(team.group) {
                            list.add('group:'+Flux.Message.toChannel(team.group));
                        }
                    }
                }
                else {
                    list.add('group:'+Flux.Message.toChannel(team.group));
                }

                // Private
                if(team.can('message/private')) {
                    list.add('private:'+Flux.Message.toChannel(team.name));
                }
                else if(team.can('message/admin')){
                    for (let team of teams) {
                        if(team.can('message/private') || team.can('message/admin')) {
                            list.add('private:'+Flux.Message.toChannel(team.name));
                        }
                    }
                }

                let out = [...list];
                out.sort();
                return resolve(out);
            })
            .catch(reject);
        }
    });
}

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
Model.prototype.getItemGroups = function() {
    let category = this.channel ? this.channel.split(':')[0] : undefined;
    return ['all', 'channel:'+this.channel, 'category:'+category ];
};

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
        else if(split[0] == 'channel') {
            filters.push({'channel': group.substr(split[0].length+1)});
        }
        // Can read only one category of channel
        else if(split[0] == 'category') {
            filters.push({'channel': { $like: group.substr(split[0].length+1)+':%'}});
        }
    }
    return filters;
};

module.exports = Model;
