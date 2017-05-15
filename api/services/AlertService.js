module.exports = {

    checkTeamActivity: function(teamId) {
        // Wait 5 seconds to avoir to send an alert on refresh
        setTimeout(() => {

            // get the team
            Team.findOne({ id: teamId }).exec((error, team) => {
                if (error || !team) return sails.log.error('Error while checking team activity: cannot find the team', error);

                // get the users of this team
                User.find({ team: team.id }).exec((error, users) => {
                    if (error) return sails.log.error('Error while checking team activity: cannot read users of the team', error);

                    const alertData = {
                        sender: team.id,
                        severity: "warning",
                        title: team.name + " n'est plus connecté",
                        category: "Deconnexion"
                    };

                    // get list of sessions associated with users from this team
                    let userIds = _.pluck(users, 'id');

                    // get the sessions of desktop user from this team
                    Session.find({user: {$in: userIds}, firebaseToken: null}).exec((error, sessions) => {
                        if (error) return sails.log.error('Error while checking team activity: cannot read sessions of the team', error);

                        let active = false;

                        // Look for active session
                        for (let session of sessions) {
                            // if this session is active, check if there is an alert to remove for this team
                            if (session.lastAction >= session.disconnectedAt) {
                                active = true;
                                break;
                            }
                        }

                        // check if an alert for this team already exist
                        Alert.findOne(alertData).exec((error, alert) => {
                            if (error) return sails.log.error('Error while checking team activity: cannot read existing alert', error);

                            // If active and already an alert, delete the alert
                            if(active && alert) {
                                Alert.destroy({id: alert.id}).exec((error) => {
                                    if (error) return sails.log.error('Error while checking team activity: cannot delete existing alert', error);
                                });
                            }
                            // If not active and no alert, create the alert
                            else if(!active && !alert) {
                                Alert.create(alertData).exec((error, alert) => {
                                    if (error) return sails.log.error('Error while checking team activity: cannot create the alert', error);

                                    // push this modification in the alert history
                                    AlertHistory.pushToHistory(alert, (error, result) => {
                                        if (error) return sails.log.error('Error while checking team activity: cannot update alert history', error);
                                    });

                                });
                            }
                        });
                    });
                });
            });
        }, 5000);
    }
};
