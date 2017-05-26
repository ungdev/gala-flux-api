const Flux = require('../../Flux');
const { ExpectedError } = require('../../lib/Errors');
const ModelController = require('../../lib/ModelController');

class AlertController extends ModelController {

    constructor() {
        super(Flux.Alert);
    }
    /**
     * @api {post} /alert/subscribe Subscribe to new items
     * @apiName subscribe
     * @apiGroup Alert
     * @apiDescription Subscribe to all new items.
     */
    //  subscribe(req, res) {}

    /**
     * @api {post} /alert/unsubscribe Unsubscribe from new items
     * @apiName subscribe
     * @apiGroup Alert
     * @apiDescription Unsubscribe from new items
     */
    //  unsubscribe(req, res) {}

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
    //  find(req, res) {}

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
    //  update(req, res) {}

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
