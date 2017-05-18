var request = require('request');
var admin = require("firebase-admin");

module.exports = {

    /**
     * Send new a notification for a new chat message
     *
     * @param {Message} message: Chat message object
     * @param {User} sender
     * @param {Team} senderTeam
     * @return {Promise}
     */
    notifyChatMessage(message, sender, senderTeam) {
        if(!sails.config.firebase.database) {
            return;
        }
        // Create receiver list
        let receivers = [];

        // Find potential receivers
        Session.find({firebaseToken: {'!': null}})
        .populate('user')
        .exec((error, sessions) => {
            if(error) sails.log.error('Error while sending alert notification to android', error);

            Team.find({id: _.pluck(sessions, 'user.team')})
            .exec((error, teams) => {
                if(error) sails.log.error('Error while sending alert notification to android', error);
                teams = _.groupBy(teams, 'id');

                // Only team which can read the channel will receive the notification
                for (let session of sessions) {
                    let team = teams[session.user.team][0];
                    if(session.user && session.user.team && teams[session.user.team] && sender.id != session.user.id) {
                        // Receive #group:[groupname] and #[teamname] but can send only in #[teamname]
                        if(Team.can(team, 'message/oneChannel') &&
                            (message.channel == 'public:'+Message.toChannel(team.name) ||
                            message.channel == 'group:'+Message.toChannel(team.group))) {
                                receivers.push(session.firebaseToken);
                        }
                        else if(Team.can(team, 'message/admin')) {
                            receivers.push(session.firebaseToken);
                        }
                        else if(Team.can(team, 'message/public')) {
                            if(message.channel.split(':')[0] == 'public') {
                                receivers.push(session.firebaseToken);
                            }
                            else if(message.channel == 'group:'+Message.toChannel(team.group)) {
                                receivers.push(session.firebaseToken);
                            }
                            else if(Team.can(team, 'message/group') && message.channel.split(':')[0] == 'group') {
                                receivers.push(session.firebaseToken);
                            }
                            else if(Team.can(team, 'message/private') && message.channel == 'private:'+Message.toChannel(team.group)) {
                                receivers.push(session.firebaseToken);
                            }
                        }
                    }
                }

                // Send message
                if(receivers.length > 0) {
                    return admin.messaging().sendToDevice(receivers,
                    {
                        data: {
                            type: 'message',
                            sender: message.sender || '',
                            senderName: sender.name || '',
                            senderTeamName: senderTeam.name || '',
                            text: message.text || '',
                            channel: message.channel || '',
                        }
                    })
                    .catch(function(error) {
                        sails.log.error('Error while sending message notification to android', error);
                    });
                }
            });
        });
    },


    /**
     * Send new a notification for a new alert
     *
     * @param {Alert} alert: Alert object
     * @return {Promise}
     */
    notifyAlert(alert) {
        if(!sails.config.firebase.database) {
            return;
        }

        // Create receiver list
        let receivers = [];

        // Find potential receivers
        Session.find({firebaseToken: {'!': null}})
        .populate('user')
        .exec((error, sessions) => {
            if(error) sails.log.error('Error while sending alert notification to android', error);

            Team.find({id: _.pluck(sessions, 'user.team')})
            .exec((error, teams) => {
                if(error) sails.log.error('Error while sending alert notification to android', error);
                teams = _.groupBy(teams, 'id');

                // Only admin or specified receiver will receive the notification
                for (let session of sessions) {
                    if(session.user && session.user.team && teams[session.user.team]) {
                        let team = teams[session.user.team][0];
                        if(Team.can(team, 'alert/read') || Team.can(team, 'alert/admin') ||
                        (Team.can(team, 'alert/restrictedReceiver') && alert.receiver == team.id) ||
                        (Team.can(team, 'ui/receiveDefaultAlerts') && !alert.receiver)) {
                            receivers.push(session.firebaseToken);
                        }
                    }
                }

                // Send to selected phones
                if(receivers.length > 0) {
                    return Team.findOneById(alert.sender || '').exec((error, team) => {
                        // Send message
                        return admin.messaging().sendToDevice(receivers,
                        {
                            data: {
                                type: 'alert',
                                id: alert.id || '',
                                sender: alert.sender || '',
                                receiver: alert.receiver || '',
                                senderName: (team && team.name) || 'Équipe supprimée',
                                senderLocation: (team && team.location) || '',
                                severity: alert.severity || 'done',
                                title: alert.title || '',
                                message: alert.message || '',
                            }
                        })
                        .catch(function(error) {
                            sails.log.error('Error while sending alert notification to android', error);
                        });
                    });
                }
            });
        });
    }
};
