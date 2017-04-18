/**
 * AlertButtonController
 *
 * @description :: Server-side logic for managing AlertButtons
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 *
 */

module.exports = {

    /**
     * @api {get} /alertbutton
     * @apiName find
     * @apiGroup AlertButton
     * @apiDescription Get the list of all alert buttons according to permissions.
     *
     * @apiSuccess {Array} An array of alert buttons
     *
     * @apiUse forbiddenError
     */
    find: (req, res) => {

        // Check permissions
        if (!(Team.can(req, 'alertButton/read') || (Team.can(req, 'alertButton/admin')))) {
            return res.error(403, 'forbidden', 'You are not authorized to read the Alert buttons.');
        }

        // read filters
        let where = {};
        if (req.allParams().filters) {
            where = req.allParams().filters;
        }

        // Find AlterButtons
        AlertButton.find()
            .exec((error, alertsButtons) => {
                if (error) {
                    return res.negotiate(error);
                }

                AlertButton.subscribe(req, _.pluck(alertsButtons, 'id'));
                AlertButton.watch(req);

                return res.ok(alertsButtons);
            });

    },

    /**
     * @api {post} /alertbutton
     * @apiName create
     * @apiGroup Alert Button
     * @apiDescription Create a new Alert Button
     *
     * @apiParam {string} receiver : The id of the team concerned about this alert (required)
     * @apiParam {string} title : The button title (required)
     * @apiParam {string} category : The button category (required)
     * @apiParam {boolean} message: Is a message required when creating an alert via this Button ? (required)
     * @apiParam {string} messagePlaceholder: Placeholder for the message to send when creating a alert (optional)
     *
     * @apiSuccess {AlertButton} The alert button that you've just created
     *
     * @apiUse badRequestError
     * @apiUse forbiddenError
     */
    create: (req, res) => {

        // Check permissions
        if (!Team.can(req, 'alertButton/admin')) {
            return res.error(403, 'forbidden', 'You are not authorized to create an Alert button.');
        }

        // Check parameters
        let missingParameters = [];
        if (!req.param('receiver')) {
            missingParameters.push('receiver');
        }
        if (!req.param('title')) {
            missingParameters.push('title');
        }
        if (req.param('message') === undefined) {
            missingParameters.push('message');
        }
        if (!req.param('category')) {
            missingParameters.push('category');
        }
        // return error with missing parameters if there are missing parameters
        if (missingParameters.length) {
            console.log(missingParameters.join(', '));
            return res.error(400, 'BadRequest', 'Unknown parameters : ' + missingParameters.join(', '));
        }

        // find the receiver team
        Team.findOne({id: req.param('receiver')}).exec((error, team) => {
            if (error) {
                return res.negotiate(error);
            }

            // Create the AlertButton
            AlertButton.create({
                receiver: team,
                title: req.param('title'),
                message: req.param('message'),
                category: req.param('category'),
                messagePlaceholder: req.param('messagePlaceholder') ? req.param('messagePlaceholder') : null
            }).exec((error, alertButton) => {
                if (error) {
                    return res.negotiate(error);
                }

                AlertButton.publishCreate(alertButton);
                AlertButton.subscribe(req, [alertButton.id]);

                return res.ok(alertButton);
            });

        });

    },

    /**
     * @api {put} /alertbutton/:id
     * @apiName update
     * @apiGroup AlertButton
     * @apiDescription Update the given alert button
     *
     * @apiParam {string} receiver : The id of the team concerned about this alert (optional)
     * @apiParam {string} title : The button title (optional)
     * @apiParam {string} category : The button category (optional)
     * @apiParam {boolean} message: Is a message required when creating an alert via this Button ? (optional)
     * @apiParam {string} messagePlaceholder: Placeholder for the message to send when creating a alert (optional)
     *
     * @apiSuccess {AlertButton} The alert button that you've just updated
     *
     * @apiUse forbiddenError
     * @apiUse notFoundError
     */
    update: (req, res) => {

        // Check permissions
        if (!Team.can(req, 'alertButton/admin')) {
            return res.error(403, 'forbidden', 'You are not authorized to update an Alert button.');
        }

        // Find AlertButton
        AlertButton.findOne({id: req.param('id')})
            .exec((error, alertButton) => {
                if (error) {
                    return res.negotiate(error);
                }
                if(!alertButton) {
                    return res.error(404, 'notfound', 'The requested alert button cannot be found');
                }

                // Update
                alertButton.receiver = req.param('receiver', alertButton.receiver);
                alertButton.title = req.param('title', alertButton.title);
                alertButton.message = req.param('message', alertButton.message);
                alertButton.category = req.param('category', alertButton.category);
                alertButton.messagePlaceholder = req.param('messagePlaceholder', alertButton.messagePlaceholder);

                alertButton.save((error) => {
                    if (error) {
                        return res.negotiate(error);
                    }

                    AlertButton.publishUpdate(alertButton.id, alertButton);
                    AlertButton.subscribe(req, [alertButton.id]);

                    return res.ok(alertButton);
                });

            });

    },

    /**
     * @api {post} /alertbutton/alert
     * @apiName create alert
     * @apiGroup AlertButton
     * @apiDescription Create an alert from this button
     *
     * @apiParam {string} id : The id of the clicked alert button (required)
     * @apiParam {string} message: A text linked to the alert (optional)
     *
     * @apiSuccess {AlertButton} The created alert
     *
     * @apiUse badRequestError
     * @apiUse forbiddenError
     * @apiUse notFoundError
     */
    createAlert: (req, res) => {

        // check permission
        if (!(Team.can(req, 'alertButton/admin') || Team.can(req, 'alertButton/create'))) {
            return res.error(403, 'forbidden', 'You are not authorized to update an Alert button.');
        }

        // Check parameters
        if(!req.param('id')) {
            return res.error(400, 'BadRequest', "The 'id' field must contains the clicked AlertButton id.");
        }

        Alert.findOne({
            button: req.param('id'),
            sender: req.team.id,
            severity: {$ne: "done"}
        }).exec((error, alert) => {
            if (error) {
                return res.negotiate(error);
            }
            // If there is already an unsolved alert like this one for this team, throw error
            if (alert) {
                return res.error(400, 'BadRequest', "This alert already exists.");
            }

            // Get the alert button clicked
            AlertButton.findOne({id: req.param('id')})
                .exec((error, alertButton) => {
                    if (error) {
                        return res.negotiate(error);
                    }
                    if(!alertButton) {
                        return res.error(404, 'notfound', 'The requested alert button cannot be found');
                    }

                    // Throw error if no message in parameters and message required for this alert
                    if(!req.param('message') && alertButton.message) {
                        return res.error(400, 'BadRequest', "This alert need a 'message'.");
                    }

                    // Create a new Alert from the Alert Button attributes
                    Alert.create({
                        sender: req.team,
                        receiver: alertButton.receiver,
                        severity: "warning",
                        title: alertButton.title,
                        category: alertButton.category,
                        button: alertButton,
                        message: req.param('message', '')
                    }).exec((error, alert) => {
                        if (error) {
                            return res.negotiate(error);
                        }

                        // push this modification in the alert history
                        AlertHistory.pushToHistory(alert, (error, result) => {
                            if (error) {
                                return res.negotiate(error);
                            }

                            Alert.publishCreate(alert);
                            Alert.subscribe(req, [alert.id]);

                            return res.ok(alert);
                        });

                    });

                });
        });

    },

    /**
     * @api {delete} /alertbutton/:id
     * @apiName destroy
     * @apiGroup AlertButton
     * @apiDescription Delete the given AlertButton
     *
     * @apiParam {string} id : Id of the alert button you want to delete
     *
     * @apiUse badRequestError
     * @apiUse forbiddenError
     * @apiUse notFoundError
     */
    destroy: function (req, res) {

        // Check permissions
        if(!Team.can(req, 'alertButton/admin')) {
            return res.error(403, 'forbidden', 'You are not authorized to delete an alert button.');
        }

        // Check parameters
        if(!req.param('id')) {
            return res.error(400, 'BadRequest', "The 'id' field must contains the AlertButton id.");
        }

        // Find the alert button
        AlertButton.findOne({id: req.param('id')})
            .exec((error, alertButton) => {
                if (error) {
                    return res.negotiate(error);
                }
                if(!alertButton) {
                    return res.error(404, 'notfound', 'The requested alert button cannot be found');
                }

                AlertButton.destroy({id: alertButton.id}).exec((error) => {
                    if (error) {
                        return res.negotiate(error);
                    }

                    AlertButton.publishDestroy(alertButton.id);

                    return res.ok();
                });
            });
    },

};


