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
    notifyChatMessage(message, sender, team) {
        if(!sails.config.firebase.database) {
            return;
        }

        // Create receiver list
        let receivers = [];
        // TODO

        // Send message
        return admin.messaging().sendToDevice(receivers,
        {
            data: {
                type: 'message',
                sender: message.sender || '',
                senderName: sender.name || '',
                senderTeamName: team.name || '',
                text: message.text || '',
                channel: message.channel || '',
            }
        })
        .catch(function(error) {
            sails.log.error('Error while sending message notification to android', error);
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
        // TODO

        return Team.findOneById(alert.sender || '').exec((error, team) => {
            // Send message
            return admin.messaging().sendToDevice(receivers,
            {
                data: {
                    type: 'alert',
                    id: alert.id || '',
                    sender: alert.sender || '',
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
        })
    }
};
