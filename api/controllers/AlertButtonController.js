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
