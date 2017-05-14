module.exports = {

    checkTeamActivity: function(teamId) {

        let active = false;

        // get the team
        Team.findOne({ id: teamId }).exec((error, team) => {
            if (error || !team) return false;

            // get the users of this team
            User.find({ team: team.id }).exec((error, users) => {
                if (error) return false;

                const alertData = {
                    sender: team.id,
                    severity: "warning",
                    title: team.name + " n'est plus connecté",
                    category: "Deconnexion"
                };

                async.each(users, (user, callback) => {
                    // get the sessions of this user
                    Session.find({user: user.id}).exec((err, sessions) => {
                        if (err) {
                            callback(err);
                        } else {
                            if (!sessions.length) {
                                callback();
                            } else {
                                for (let session of sessions) {
                                    // if this session is active, check if there is an alert to remove for this team
                                    if (session.lastAction >= session.disconnectedAt) {
                                        active = true;
                                        // if an alert has been sent for this team, destroy it
                                        Alert.findOne(alertData)
                                            .exec((error, alert) => {
                                                if (error) {
                                                    callback(error);
                                                } else if (!alert) {
                                                    callback();
                                                } else {
                                                    Alert.destroy({id: alert.id}).exec((error) => {
                                                        if (error) {
                                                            callback(error);
                                                        } else {
                                                            callback();
                                                        }
                                                    });
                                                }
                                            });
                                    } else {
                                        callback();
                                    }
                                }

                            }
                        }
                    });
                }, err => {

                    // an error occured
                    if (err) return err;

                    // no error => if the team isn't active, an alert is required
                    if (!active) {
                        // check if an alert for this team already exist
                        Alert.findOne(alertData).exec((error, alert) => {
                            if (error || alert) return;
                            // if there is no alert for this team, create one
                            Alert.create(alertData).exec((error, alert) => {
                                if (error) return;

                                // push this modification in the alert history
                                AlertHistory.pushToHistory(alert, (error, result) => {
                                    if (error) return false;
                                });

                            });
                        });
                    }
                });

            });
        });
    }

};
