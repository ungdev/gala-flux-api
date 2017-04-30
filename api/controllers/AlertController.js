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
        if (!(Team.can(req, 'alert/read') || (Team.can(req, 'alert/restricted')))) {
            return res.error(403, 'forbidden', 'You are not authorized to read alerts.');
        }

        let where = {};
        if (Team.can(req, 'alert/restricted')) {
            // alert sent by his team
            where.sender = req.team.id;
            where.severity = {$ne: "done"};
        } else {
            // alert for his team
            where = {
                or: [
                    { receiver: req.team.id },
                    { receiver: null }
                ]
            };
        }

        // Find alert where the receiver is the requester's team
        Alert.find(where).populate('users').exec((error, alerts) => {
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
    update: (req, res) => {

        // Check permissions
        if (!(Team.can(req, 'alert/update') || (Team.can(req, 'alert/restricted')))) {
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
                if ((Team.can(req, 'alert/restricted') && alert.sender !== req.team.id) || (!Team.can(req, 'alert/restricted') && (alert.receiver !== null && req.team.id != alert.receiver))) {
                    return res.error(403, 'forbidden', 'You are not allowed to update this alert.');
                }

                if (req.param('severity')) {
                    alert.severity = req.param('severity');
                }

                if (req.param('message') !== undefined) {
                    // only the sender can update the message of his alert
                    if (Team.can(req, 'alert/restricted')) {
                        alert.message = req.param('message');
                    } else {
                         return res.error(403, 'forbidden', 'You are not allowed to update the message of this alert.');
                    }
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
     * @api {put} /alert/:id/users
     * @apiName updateAssignedUsers
     * @apiGroup Alert
     * @apiDescription Update the list of users assigned to this alert
     *
     * @apiParam {string} id : The id of the alert to update (required)
     * @apiParam {string} users : The new users list (required)
     *
     * @apiSuccess {Alert} The alert that you've just updated
     *
     * @apiUse badRequestError
     * @apiUse forbiddenError
     * @apiUse notFoundError
     */
    updateAssignedUsers: (req, res) => {

        // Check permissions
        if (!(Team.can(req, 'alert/update'))) {
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
        Alert.findOne({id: req.param('id')}).populate('users').exec((error, alert) => {

            if (error) {
                return res.negotiate(error);
            }
            if (!alert) {
                return res.error(404, 'notfound', 'The requested alert cannot be found');
            }


            // users added
            let added = req.param('users').filter(user => !findById(alert.users, user.id));
            // users removed
            let removed = alert.users.filter(user => !findById(req.param('users'), user.id));

            for (let user of added) {
                addUser(alert, user.id);
            }
            for (let user of removed) {
                removeUser(alert, user.id);
            }

            Alert.publishUpdate(alert.id, alert);

            return res.ok(alert);

        });

    }

};

/**
 * Find a object by id in an array
 * @param {array} arr: array of object
 * @param {string} id: id of the element to find
 * @returns {object|null}: the object found or null
 */
function findById(arr, id) {
    for (let el of arr) {
        if (el.id === id) {
            return el;
        }
    }
    return null;
}


/**
 * Add a user to an alert
 * @param {object} alert: the alert to update
 * @param {string} id: the id of the user to add
 * @return {boolean}: success
 */
function addUser(alert, id) {

    User.findOne({id}).exec((error, user) => {

        // assign a new user to this alert.
        alert.users.add(user);

        // Save the alert, creating the new association in the join table
        alert.save((error) => {
            if (error) {
                return false;
            }

            return true;
        });

    });

}

/**
 * Remove a user of an alert
 * @param {object} alert: the alert to update
 * @param {string} id: the id of the user to remove
 * @return {boolean}: success
 */
function removeUser(alert, id) {

    User.findOne({id}).exec((error, user) => {

        // assign a new user to this alert.
        alert.users.remove(user.id);

        // Save the alert, creating the new association in the join table
        alert.save((error) => {
            if (error) {
                return false;
            }

            return true;
        });

    });

}