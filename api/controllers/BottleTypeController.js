const Flux = require('../../Flux');
const { ExpectedError } = require('../../lib/Errors');
const ModelController = require('../../lib/ModelController');

class BottleTypeController extends ModelController {

    constructor() {
        super(Flux.BottleType);
    }


    /**
     * @api {post} /bottletype/subscribe Subscribe to new items
     * @apiName subscribe
     * @apiGroup BottleType
     * @apiDescription Subscribe to all new items.
     */
    //  subscribe(req, res) {}


    /**
     * @api {post} /bottletype/unsubscribe Unsubscribe from new items
     * @apiName subscribe
     * @apiGroup BottleType
     * @apiDescription Unsubscribe from new items
     */
    //  unsubscribe(req, res) {}

    /**
     * @api {get} /bottletype/find Find all bottletypes
     * @apiName find
     * @apiGroup BottleType
     * @apiDescription Get the list of all bottletypes
     *
     * @apiUse forbiddenError
     *
     * @apiSuccess {Array} Array An array of bottletypes
     * @apiSuccess {BottleType} Array.bottletype A bottletype object
     * @apiSuccess {string} Array.bottletype.name Complete display name of the bottletype
     * @apiSuccess {string} Array.bottletype.shortName Short display name of the bottletype
     * @apiSuccess {integer} Array.bottletype.quantityPerBox Number of bottletypes per box
     * @apiSuccess {integer} Array.bottletype.sellPrice Price at which the bottletypes are sold in cents
     * @apiSuccess {integer} Array.bottletype.supplierPrice Price at which the bottletypes were bought in cents
     * @apiSuccess {integer} Array.bottletype.originalStock Number of bottletypes at the beginning of the event
     */
    //  find(req, res) {}


    /**
     * @api {post} /bottletype/create Create bottletype
     * @apiName create
     * @apiGroup BottleType
     * @apiDescription Create a bottletype
     *
     * @apiParam {string} name Complete display name of the bottletype you want to edit
     * @apiParam {string} shortName Short display name of the bottletype
     * @apiParam {integer} quantityPerBox Number of bottletypes per box
     * @apiParam {integer} sellPrice Price at which the bottletypes are sold in cents
     * @apiParam {integer} supplierPrice Price at which the bottletypes were bought in cents
     * @apiParam {integer} originalStock Number of bottletypes at the beginning of the event
     *
     * @apiSuccess {BottleType} bottletype The bottletype you've just created
     *
     * @apiUse badRequestError
     * @apiUse forbiddenError
     */
    //  create(req, res) {}

    /**
     * @api {delete} /bottletype/:id Delete a bottletype
     * @apiName destroy
     * @apiGroup BottleType
     * @apiDescription Delete the given bottletype
     *
     * @apiParam {id} id Id of the bottletype you want to delete
     *
     * @apiUse badRequestError
     * @apiUse forbiddenError
     * @apiUse notFoundError
     */
    //  destroy(req, res) {}


    /**
     * @api {put} /bottletype/:id Update bottletype
     * @apiName update
     * @apiGroup BottleType
     * @apiDescription Update the given bottletype
     *
     * @apiParam {string} name Complete display name of the bottletype you want to edit
     * @apiParam {string} shortName Short display name of the bottletype
     * @apiParam {integer} quantityPerBox Number of bottletypes per box
     * @apiParam {integer} sellPrice Price at which the bottletypes are sold in cents
     * @apiParam {integer} supplierPrice Price at which the bottletypes were bought in cents
     * @apiParam {integer} originalStock Number of bottletypes at the beginning of the event
     *
     * @apiSuccess {BottleType} bottletype The bottletype you have just updated
     *
     * @apiUse badRequestError
     * @apiUse forbiddenError
     * @apiUse notFoundError
     */
    //  update(req, res) {}
};

module.exports = BottleTypeController;
