const Flux = require('../../Flux');
const { ExpectedError } = require('../../lib/Errors');
const ModelController = require('../../lib/ModelController');

class AlertButtonController extends ModelController {

    constructor() {
        super(Flux.AlertButton);
    }

    /**
     * @api {post} /alertbutton/subscribe Subscribe to new items
     * @apiName subscribe
     * @apiGroup AlertButton
     * @apiDescription Subscribe to all new items.
     */
    //  subscribe(req, res) {}


    /**
     * @api {post} /alertbutton/unsubscribe Unsubscribe from new items
     * @apiName subscribe
     * @apiGroup AlertButton
     * @apiDescription Unsubscribe from new items
     */
    //  unsubscribe(req, res) {}


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
    //  find(req, res) {}

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
    //  create(req, res) {}

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
    //  update(req, res) {}

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
                            AlertLog.pushToHistory(alert, (error, result) => {
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
    //  destroy(req, res) {}

}

module.exports = AlertButtonController;
