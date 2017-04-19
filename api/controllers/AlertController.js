/**
 * AlertController
 *
 * @description :: Server-side logic for managing alerts
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 *
 */

module.exports = {

    /**
     * @api {get} /alert
     * @apiName find
     * @apiGroup Alert
     * @apiDescription Get the alerts where the receiver is the the team of the requester.
     *
     * @apiSuccess {Array} An array of alerts
     *
     * @apiUse forbiddenError
     */
    find: (req, res) => {

        // Check permissions
        if (!(Team.can(req, 'alert/read'))) {
            return res.error(403, 'forbidden', 'You are not authorized to read alerts.');
        }

        // Find alert where the receiver is the requester's team
        Alert.find({
            receiver: req.team.id
        }).populate('users').exec((error, alerts) => {
                if (error) {
                    return res.negotiate(error);
                }

                Alert.subscribe(req, _.pluck(alerts, 'id'));
                Alert.watch(req);

                return res.ok(alerts);
            });

    },

    /**
     * @api {put} /alert/:id
     * @apiName update
     * @apiGroup Alert
     * @apiDescription Update the given alert. Only the severity can be updated.
     *
     * @apiParam {string} id : The id of the alert to update(required)
     * @apiParam {string} severity : The alert severity (required)
     *
     * @apiSuccess {Alert} The alert that you've just updated
     *
     * @apiUse badRequestError
     * @apiUse forbiddenError
     * @apiUse notFoundError
     */
    update: (req, res) => {

        // Check permissions
        if (!(Team.can(req, 'alert/update'))) {
            return res.error(403, 'forbidden', 'You are not authorized to update alerts.');
        }

        // Check parameters
        let missingParameters = [];
        if (!req.param('id')) {
            missingParameters.push('id');
        }
        if (!req.param('severity')) {
            missingParameters.push('severity');
        }
        if (missingParameters.length) {
            return res.error(400, 'BadRequest', 'Unknown parameters : ' + missingParameters.join(', '));
        }

        // get the Alert to update
        Alert.findOne({id: req.param('id')})
            .exec((error, alert) => {
                if (error) {
                    return res.negotiate(error);
                }
                if (!alert) {
                    return res.error(404, 'notFound', 'The requested alert cannot be found');
                }

                // Check if the requester is in the receiver team
                if (req.team.id != alert.receiver) {
                    return res.error(403, 'forbidden', 'You are not allowed to update this alert.');
                }

                // Update if the severity is right
                if (req.param('severity') == 'done' && (alert.severity == 'warning' || alert.severity == 'serious')
                    || req.param('severity') == 'serious' && alert.severity == 'warning') {
                    alert.severity = req.param('severity');
                } else {
                    // can't set severity with this value
                    return res.error(400, 'BadRequest', "Can't set severity to " + req.param('severity'));
                }

                alert.save((error) => {
                    if (error) {
                        return res.negotiate(error);
                    }

                    // push this modification in the alert history
                    AlertHistory.pushToHistory(alert, (error, result) => {
                        if (error) {
                            return res.negotiate(error);
                        }

                        Alert.publishUpdate(alert.id, alert);
                        Alert.subscribe(req, [alert.id]);

                        return res.ok(alert);
                    });
                });
            });

    },

    /**
     * @api {post} /alert/user/add
     * @apiName addUser
     * @apiGroup Alert
     * @apiDescription Create a new record in the join table between the Alert and User models.
     *
     * @apiParam {string} alert : The id of the alert to update(required)
     * @apiParam {string} user : The id of the user to add (required)
     *
     * @apiSuccess {Alert} The alert that you've just updated
     *
     * @apiUse badRequestError
     * @apiUse forbiddenError
     * @apiUse notFoundError
     */
    addUser: (req, res) => {

        // Check permissions
        if (!(Team.can(req, 'alert/update'))) {
            return res.error(403, 'forbidden', 'You are not authorized to update alerts.');
        }

        // Check parameters
        let missingParameters = [];
        if (!req.param('alert')) missingParameters.push('alert');
        if (!req.param('user')) missingParameters.push('user');
        if (missingParameters.length) {
            return res.error(400, 'BadRequest', 'Unknown parameters : ' + missingParameters.join(', '));
        }

        Alert.findOne({id: req.param('alert')}).exec((error, alert) => {
            if (error) {
                return res.negotiate(error);
            }
            if (!alert) {
                return res.error(404, 'notfound', 'The requested alert cannot be found');
            }

            // assign a new user to this alert.
            alert.users.add(req.param('user'));

            // Save the alert, creating the new association in the join table
            alert.save((error) => {
                if (error) {
                    return res.negotiate(error);
                }

                Alert.publishUpdate(alert.id, alert);
                Alert.subscribe(req, [alert.id]);

                return res.ok(alert);
            });
        });

    },

    /**
     * @api {post} /alert/user/remove
     * @apiName removeUser
     * @apiGroup Alert
     * @apiDescription Remove a record in the join table between the Alert and User models.
     *
     * @apiParam {string} alert : The id of the alert to update(required)
     * @apiParam {string} user : The id of the user to remove (required)
     *
     * @apiSuccess {Alert} The alert that you've just updated
     *
     * @apiUse badRequestError
     * @apiUse forbiddenError
     * @apiUse notFoundError
     */
    removeUser: (req, res) => {

        // Check permissions
        if (!(Team.can(req, 'alert/update'))) {
            return res.error(403, 'forbidden', 'You are not authorized to update alerts.');
        }

        // Check parameters
        let missingParameters = [];
        if (!req.param('alert')) missingParameters.push('alert');
        if (!req.param('user')) missingParameters.push('user');
        if (missingParameters.length) {
            return res.error(400, 'BadRequest', 'Unknown parameters : ' + missingParameters.join(', '));
        }

        Alert.findOne({id: req.param('alert')}).exec((error, alert) => {
            if (error) {
                return res.negotiate(error);
            }
            if (!alert) {
                return res.error(404, 'notfound', 'The requested alert cannot be found');
            }

            // remove a user to this alert.
            alert.users.remove(req.param('user'));

            // Save the alert, removing the association in the join table
            alert.save((error) => {
                if (error) {
                    return res.negotiate(error);
                }

                Alert.publishUpdate(alert.id, alert);
                Alert.subscribe(req, [alert.id]);

                return res.ok(alert);
            });
        });

    }


};
