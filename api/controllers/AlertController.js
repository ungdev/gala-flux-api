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

}

module.exports = AlertController;
