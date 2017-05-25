/**
 * AlertController
 *
 * @description :: Server-side logic for managing alerts
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 *
 */

class AlertController {

    /**
     * @api {post} /alert/subscribe Subscribe to new items
     * @apiName subscribe
     * @apiGroup Alert
     * @apiDescription Subscribe to all new items.
     */
     subscribe(req, res) {
        // if(req.team.can('alert/read') || req.team.can('alert/admin')) {
        //     Alert.watch(req);
        //     Alert.find().exec((error, items) => {
        //         if(error) return res.negotiate(error);
        //         Alert.subscribe(req, _.pluck(items, 'id'));
        //         return res.ok();
        //     });
        // }
        // else if(req.team.can('alert/restrictedSender') || req.team.can('alert/restrictedReceiver')) {
        //     // Join only for update of it own bottles
        //     sails.sockets.join(req, 'alert/' + req.team.id, (error) => {
        //         if (error) return res.negotiate(error);
        //         return res.ok();
        //     });
        // }
        // else {
        //     return res.ok();
        // }
    }

    /**
     * @api {post} /alert/unsubscribe Unsubscribe from new items
     * @apiName subscribe
     * @apiGroup Alert
     * @apiDescription Unsubscribe from new items
     */
     unsubscribe(req, res) {
        // sails.sockets.leave(req, 'alert/' + req.team.id, () => {
        //     Alert.unwatch(req);
        //     Alert.find().exec((error, items) => {
        //         if(error) return res.negotiate(error);
        //         Alert.unsubscribe(req, _.pluck(items, 'id'));
        //         return res.ok();
        //     });
        // });
    }

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
     find(req, res) {
        // Check permissions
        // if (!(req.team.can('alert/admin') || req.team.can('alert/read') || req.team.can('alert/restrictedSender') || req.team.can('alert/restrictedReceiver'))) {
        //     return res.error(403, 'forbidden', 'You are not authorized to read alerts.');
        // }
        //
        // // read filters
        // let where = {};
        // if (req.allParams().filters) {
        //     where = req.allParams().filters;
        // }
        // // if the requester is not admin, show only his team's alert
        // if (req.team.can('alert/restrictedSender')) {
        //     let whereTmp = where;
        //     where = {
        //         severity: {'!': 'done'},
        //         sender: req.team.id,
        //     };
        //     if(whereTmp && Object.keys(whereTmp).length) where.or = whereTmp;
        // }
        // else if (req.team.can('alert/restrictedReceiver')) {
        //     let whereTmp = where;
        //     where = {
        //         receiver: req.team.id,
        //     };
        //     if(whereTmp && Object.keys(whereTmp).length) where.or = whereTmp;
        // }
        //
        // // Find alerts
        // Alert.find(where)
        // .exec((error, alerts) => {
        //     if (error) {
        //         return res.negotiate(error);
        //     }

            return res.ok({alerts: 'bite'});
        // });
    }

    /**
     * @api {put} /alert/:id
     * @apiName update
     * @apiGroup Alert
     * @apiDescription Update the given alert. Only the severity and the message can be updated (depending of the requester's role).
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
     update(req, res) {

        // Check permissions
        if (!(req.team.can('alert/admin') || req.team.can('alert/restrictedSender') || req.team.can('alert/restrictedReceiver'))) {
            return res.error(403, 'forbidden', 'You are not authorized to update alerts.');
        }

        // Check parameters
        if (!req.param('id')) {
            return res.error(400, 'BadRequest', "Missing 'id' parameter.");
        }
        if (!req.param('severity') && req.param('message') === undefined) {
            return res.error(400, 'BadRequest', "Nothing to update.");
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

                // if the request can only update from his team, check the sender
                // else, check if the requester is in the receiver team
                if ((req.team.can('alert/restrictedSender') && (alert.sender !== req.team.id || alert.severity == 'done')) ||
                (req.team.can('alert/restrictedReceiver') && alert.receiver != req.team.id)) {
                    return res.error(403, 'forbidden', 'You are not allowed to update this alert.');
                }

                if (req.param('severity')) {
                    alert.severity = req.param('severity');
                }

                if (req.param('message') !== undefined) {
                    alert.message = req.param('message');
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

                        return res.ok(alert);
                    });
                });
            });

    }

    /**
     * @api {put} /alert/:id/users
     * @apiName updateAssignedUsers
     * @apiGroup Alert
     * @apiDescription Update the list of users assigned to this alert
     *
     * @apiParam {string} id : The id of the alert to update (required)
     * @apiParam {string} users : The new users list as a list of id (required)
     *
     * @apiSuccess {Alert} The alert that you've just updated
     *
     * @apiUse badRequestError
     * @apiUse forbiddenError
     * @apiUse notFoundError
     */
     updateAssignedUsers(req, res) {

        // Check permissions
        if (!(req.team.can('alert/admin') || req.team.can('alert/restrictedReceiver'))) {
            return res.error(403, 'forbidden', 'You are not authorized to update alerts.');
        }

        // Check parameters
        let missingParameters = [];
        if (!req.param('id')) missingParameters.push('id');
        if (!req.param('users')) missingParameters.push('users');
        if (missingParameters.length) {
            return res.error(400, 'BadRequest', 'Unknown parameters : ' + missingParameters.join(', '));
        }

        // find the requested Alert
        Alert.findOne({id: req.param('id')}).exec((error, alert) => {

            if (error) {
                return res.negotiate(error);
            }
            if (!alert) {
                return res.error(404, 'notfound', 'The requested alert cannot be found');
            }

            alert.users = req.param('users');
            alert.save((error) => {
                if (error) {
                    return res.negotiate(error);
                }

                return res.ok(alert);
            });
        });
    }
}

module.exports = AlertController;
