/**
 * AlertButtonController
 *
 * @description :: Server-side logic for managing AlertButtons
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 *
 */

class AlertButtonController {

    /**
     * @api {post} /alertbutton/subscribe Subscribe to new items
     * @apiName subscribe
     * @apiGroup AlertButton
     * @apiDescription Subscribe to all new items.
     */
     subscribe(req, res) {
        if(req.team.can('alertButton/read') || req.team.can('alertButton/admin')) {
            AlertButton.watch(req);
            AlertButton.find().exec((error, items) => {
                if(error) return res.negotiate(error);
                AlertButton.subscribe(req, _.pluck(items, 'id'));
                return res.ok();
            });
        }
        else {
            return res.ok();
        }
    }


    /**
     * @api {post} /alertbutton/unsubscribe Unsubscribe from new items
     * @apiName subscribe
     * @apiGroup AlertButton
     * @apiDescription Unsubscribe from new items
     */
     unsubscribe(req, res) {
        AlertButton.unwatch(req);
        AlertButton.find().exec((error, items) => {
            if(error) return res.negotiate(error);
            AlertButton.unsubscribe(req, _.pluck(items, 'id'));
            return res.ok();
        });
    }


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
     find(req, res) {

        // Check permissions
        if (!(req.team.can('alertButton/read') || (req.team.can('alertButton/admin')))) {
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

    }

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
     create(req, res) {
        // Check permissions
        if (!req.team.can('alertButton/admin')) {
            return res.error(403, 'forbidden', 'You are not authorized to create an Alert button.');
        }

        // find the receiver team
        AlertButton.validateForeignKey('receiver', req.param('receiver'))
        .then(team => {
            // Create the AlertButton
            AlertButton.create({
                title: req.param('title'),
                category: req.param('category'),
                senderGroup: req.param('senderGroup'),
                receiver: req.param('receiver'),
                messageRequired: req.param('messageRequired'),
                messagePrompt: req.param('messagePrompt'),
                messageDefault: req.param('messageDefault'),
            }).exec((error, alertButton) => {
                if (error) {
                    return res.negotiate(error);
                }
                return res.ok(alertButton);
            });
        })
        .catch(error => {
            return res.badRequest(error);
        });
    }

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
     update(req, res) {

        // Check permissions
        if (!req.team.can('alertButton/admin')) {
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

            // Set new values
            alertButton.title = req.param('title', alertButton.title);
            alertButton.category = req.param('category', alertButton.category);
            alertButton.senderGroup = req.param('senderGroup', alertButton.senderGroup);
            alertButton.receiver = req.param('receiver', alertButton.receiver);
            alertButton.messageRequired = req.param('messageRequired', alertButton.messageRequired);
            alertButton.messagePrompt = req.param('messagePrompt', alertButton.messagePrompt);
            alertButton.messageDefault = req.param('messageDefault', alertButton.messageDefault);

            // find the receiver team
            AlertButton.validateForeignKey('receiver', alertButton)
            .then(team => {
                // Save into db
                alertButton.save((error) => {
                    if (error) {
                        return res.negotiate(error);
                    }
                    return res.ok(alertButton);
                });
            })
            .catch(error => {
                return res.badRequest(error);
            });
        });
    }

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
     createAlert(req, res) {

        // check permission
        if (!(req.team.can('alertButton/admin') || req.team.can('alertButton/createAlert'))) {
            return res.error(403, 'forbidden', 'You are not authorized to update an Alert button.');
        }

        // Check parameters
        if(!req.param('button')) {
            return res.error(400, 'BadRequest', "The 'button' field must contains the clicked AlertButton id.");
        }
        const teamId = (req.param('team') !== 'null') && (req.param('team') !== null) ? req.param('team') : req.team.id;
        if (!(req.team.can('alertButton/admin')) && (teamId !== req.team.id)) {
            return res.error(403, 'forbidden', 'You are not authorized to create an Alert for another team.');
        }

        Team.findOne({id: teamId}).exec((error, team) => {
            if (error) return res.negotiate(error);

            Alert.findOne({
                button: req.param('button'),
                sender: team,
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
                AlertButton.findOne({id: req.param('button')})
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
                            sender: team,
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

                                return res.ok(alert);
                            });

                        });

                    });
            });
        });

    }

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
     destroy(req, res) {

        // Check permissions
        if(!req.team.can('alertButton/admin')) {
            return res.error(403, 'forbidden', 'You are not authorized to delete an alert button.');
        }

        // Check parameters
        if(!req.param('id')) {
            return res.error(400, 'BadRequest', "The 'id' field must contains the AlertButton id.");
        }

        // Find the alert button
        AlertButton.findOne({id: req.param('id')})
        .exec((error, alertButton) => {
            if (error) return res.negotiate(error);

            if(!alertButton) {
                return res.error(404, 'notfound', 'The requested alert button cannot be found');
            }

            AlertButton.destroy({id: alertButton.id})
            .exec((error) => {
                if (error) return res.negotiate(error);

                return res.ok();
            });
        });
    }

};

module.exports = AlertButtonController;
