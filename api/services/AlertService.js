module.exports = {

    checkTeamActivity: function(teamId) {

        // get the team
        Team.findOne({ id: teamId }).exec((error, team) => {
            // get the users of this team
            User.find({ team: team.id }).exec((error, users) => {

                const alertData = {
                    sender: team.id,
                    severity: "serious",
                    title: "Team" + team.name + " deconnectée",
                    category: "Deconnexion"
                };

                if (error) {
                    return false;
                }

                // check if a user of this team is active
                for (let user of users) {

                    if (user.lastConnection > user.lastDisconnection) {

                        // check if an alert has been sent for this team
                        Alert.findOne(alertData)
                            .exec((error, alert) => {
                                if (error || !alert) return;

                                Alert.destroy({id: alert.id}).exec((error) => {
                                    if (error) return;
                                });
                            });
                        return true;
                    }
                }

                // an alert has to be created

                // check if an alert for this team already exist
                Alert.findOne(alertData)
                    .exec((error, alert) => {
                        // if there is no alert for this team, create one
                        if (!alert) {
                            Alert.create(alertData)
                                .exec((error, alert) => {
                                    if (error) return;

                                    // push this modification in the alert history
                                    AlertHistory.pushToHistory(alert, (error, result) => {
                                        if (error) return false;
                                    });

                                });
                        }
                    });

            });
        });
    }

};
