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
     * @api {get} /bottleAction/count Give the counts of bottles
     * @apiName find
     * @apiGroup BottleAction
     * @apiDescription Give the current number of bottle of each type for each team
     *
     * @apiUse forbiddenError
     */

     count(req, res) {
        //  let filters = req.data.filters || {true: true};
        //  if(!Array.isArray(filters)) {
        //      filters = [filters];
        //  }
        //
        //  let where = {
        //      $or: this._model.getReadFilters(req.team, req.user),
        //      $and: { $or: filters }
        //  };
        //
        //  this._model.findAll(where)
        //  .then(res.ok)
        //  .catch(res.error);
        //
        // // read filters
        // let where = {};
        // // if the requester is not admin, show only his team's bottleActions
        // if (req.team.can('bottleAction/restricted')) {
        //     where = [{ team: req.team.id }, { fromTeam: req.team.id }];
        // }
        //
        // // Find bottleTypes
        // BottleType.find()
        // .exec((error, bottleTypes) => {
        //     if (error) {
        //         return res.negotiate(error);
        //     }
        //
        //     // Find bottleActions
        //     BottleAction.find(where)
        //     .exec((error, bottleActions) => {
        //         if (error) {
        //             return res.negotiate(error);
        //         }
        //
        //         // Init result object
                let result = {
                    null: {},
                };
        //         for (let type of bottleTypes) {
        //             result[null][type.id] = {new: type.originalStock, empty: 0};
        //         }
        //
        //         // Update it with actions
        //         for (let bottleAction of bottleActions) {
        //             // Init team level
        //             if(!result[bottleAction.team || null]) {
        //                 result[bottleAction.team || null] = {};
        //             }
        //             if(!result[bottleAction.fromTeam || null]) {
        //                 result[bottleAction.fromTeam || null] = {};
        //             }
        //
        //             // Init bottleType level
        //             if(!result[bottleAction.team || null][bottleAction.type]) {
        //                 result[bottleAction.team || null][bottleAction.type] = {new: 0, empty: 0};
        //             }
        //             if(!result[bottleAction.fromTeam || null][bottleAction.type]) {
        //                 result[bottleAction.fromTeam || null][bottleAction.type] = {new: 0, empty: 0};
        //             }
        //
        //             // Update state entry
        //             if(bottleAction.operation == 'purchased') {
        //                 result[bottleAction.team || null][bottleAction.type].new -= bottleAction.quantity;
        //                 result[bottleAction.team || null][bottleAction.type].empty += bottleAction.quantity;
        //             }
        //             else if(bottleAction.operation == 'moved') {
        //                 result[bottleAction.fromTeam || null][bottleAction.type].new -= bottleAction.quantity;
        //                 result[bottleAction.team || null][bottleAction.type].new += bottleAction.quantity;
        //             }
        //         }
        //
                return res.ok(result);
        //     });
        // });
    }

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
