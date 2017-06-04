const Flux = require('../../Flux');
const { ForbiddenError } = require('../../lib/Errors');
const ModelController = require('../../lib/ModelController');

class BottleActionController extends ModelController {

    constructor() {
        super(Flux.BottleAction);
    }

    /**
     * @api {post} /bottleAction/subscribe Subscribe to new items
     * @apiName subscribe
     * @apiGroup BottleAction
     * @apiDescription Subscribe to all new items.
     */
    //  subscribe(req, res) {}

    /**
     * @api {post} /bottleAction/unsubscribe Unsubscribe from new items
     * @apiName subscribe
     * @apiGroup BottleAction
     * @apiDescription Unsubscribe from new items
     */
    //  unsubscribe(req, res) {}


    /**
     * @api {get} /bottleAction/find Find all bottles actions related to the bar
     * @apiName find
     * @apiGroup BottleAction
     * @apiDescription Get the list of all bottle actions
     *
     * @apiUse forbiddenError
     *
     * @apiSuccess {Array} Array An array of bottles actions
     * @apiSuccess {BottleAction} Array.bottleAction A bottle action object
     * @apiSuccess {string} Array.bottle.team Team which produced a bottle action
     * @apiSuccess {string} Array.bottle.type Id of the concerned bottle
     * @apiSuccess {integer} Array.bottle.quantity Number of bottles sold or moved (can be negative)
     * @apiSuccess {string} Array.bottle.operation Operation performed on the bottle (sold or moved)
     */
    //  find(req, res) {}

    /**
     * @api {post} /bottleaction/create Create a bottle action
     * @apiName create
     * @apiGroup BottleAction
     * @apiDescription Create a bottle action
     *
     * @apiParam {string} team Name of the team performing the bottle action
     * @apiParam {string} type Id of the bottle
     * @apiParam {integer} quantity Number of bottles concerned (can be negative)
     * @apiParam {string} operation Operation performed on the bottle (purchased or moved)
     *
     * @apiSuccess {BottleAction} bottleAction The bottle action you've just created
     *
     * @apiUse badRequestError
     * @apiUse forbiddenError
     */
    //  create(req, res) {}
}

module.exports = BottleActionController;
