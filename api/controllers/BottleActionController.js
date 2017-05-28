const Flux = require('../../Flux');
const { ForbiddenError } = require('../../lib/Errors');
const ModelController = require('../../lib/ModelController');

class BottleActionController extends ModelController {

    constructor() {
        super(Flux.BottleAction);
    }

    /**
     * @api {get} /bottleAction/count Give the counts of bottles
     * @apiName find
     * @apiGroup BottleAction
     * @apiDescription Give the current number of bottle of each type for each team
     *
     * @apiUse forbiddenError
     */

    count(req, res) {

        let types;

        Flux.BottleType.findAll({ where: { $or: Flux.BottleType.getReadFilters(req.team, req.user) }})
        .then(data => {
            types = data;

            return Flux.BottleAction.findAll({ where: { $or: Flux.BottleAction.getReadFilters(req.team, req.user) }});
        })
        .then(bottleActions => {

            // Init result object
            let result = {
                null: {},
            };

            // Add originalStock to result
            for (let type of types) {
                result[null][type.id] = {new: type.originalStock, empty: 0};
            }

            // Update it with actions
            for (let action of bottleActions) {
                // Init team
                if(!result[action.teamId || null]) {
                    result[action.teamId || null] = {};
                }
                if(!result[action.fromTeamId || null]) {
                    result[action.fromTeamId || null] = {};
                }

                // Init bottleType per team
                if(!result[action.teamId || null][action.typeId]) {
                    result[action.teamId || null][action.typeId] = {new: 0, empty: 0};
                }
                if(!result[action.fromTeamId || null][action.typeId]) {
                    result[action.fromTeamId || null][action.typeId] = {new: 0, empty: 0};
                }

                // Update state entry
                if(action.operation == 'purchased') {
                    result[action.teamId || null][action.typeId].new -= action.quantity;
                    result[action.teamId || null][action.typeId].empty += action.quantity;
                }
                else if(action.operation == 'moved') {
                    result[action.fromTeamId || null][action.typeId].new -= action.quantity;
                    result[action.teamId || null][action.typeId].new += action.quantity;
                }
            }

            res.ok(result);
        })
        .catch(res.error);
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
