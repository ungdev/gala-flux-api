const Flux = require('../../Flux');
const Controller = require('./Controller');

/**
 * @apiDefine badRequestError
 * @apiError BadRequest Parameters are not valid for this api endpoint
 * @apiErrorExample BadRequest
 *     HTTP/1.1 400 Bad Request
 *     {
 *         "_error": {
 *             code: 400,
 *             status: 'BadRequest',
 *             message: 'Parameters are not valid for this api endpoint'
 *         }
 *     }
 *
 */
/**
 * @apiDefine forbiddenError
 * @apiError forbidden You are not authorized to to that
 * @apiErrorExample forbidden
 *     HTTP/1.1 403 Forbidden
 *     {
 *         "_error": {
 *             code: 403,
 *             status: 'forbidden',
 *             message: 'You are not authorized to to that'
 *         }
 *     }
 *
 */
/**
 * @apiDefine notFoundError
 * @apiError notfound Item cannot be found
 * @apiErrorExample notfound
 *     HTTP/1.1 404 Not Found
 *     {
 *         "_error": {
 *             code: 404,
 *             status: 'notfound',
 *             message: 'Item cannot be found'
 *         }
 *     }
 *
 */


class TeamController extends Controller {

    constructor() {
        super(Flux.Team);
    }
    /**
     * @api {post} /team/subscribe Subscribe to new items
     * @apiName subscribe
     * @apiGroup Team
     * @apiDescription Subscribe to all new items.
     */
     subscribe(req, res) {
        // if(req.team.can('team/read') || req.team.can('team/admin')) {
        //     Team.watch(req);
        //     Team.find().exec((error, items) => {
        //         if(error) return res.negotiate(error);
        //         Team.subscribe(req, _.pluck(items, 'id'));
        //         return res.ok();
        //     });
        // }
        // else {
        //     Team.subscribe(req, [req.team.id]);
        //     return res.ok();
        // }
        return res.ok();
    }


    /**
     * @api {post} /team/unsubscribe Unsubscribe from new items
     * @apiName subscribe
     * @apiGroup Team
     * @apiDescription Unsubscribe from new items
     */
     unsubscribe(req, res) {
        // Team.unwatch(req);
        // Team.find().exec((error, items) => {
        //     if(error) return res.negotiate(error);
        //     Team.unsubscribe(req, _.pluck(items, 'id'));
        //     return res.ok();
        // });
        return res.ok();
    }

    /**
     * @api {get} /team/find Find all teams and subscribe to them
     * @apiName find
     * @apiGroup Team
     * @apiDescription Get the list of all teams.
     *
     * @apiUse forbiddenError
     *
     * @apiSuccess {Array} Array An array of teams
     * @apiSuccess {Team} Array.team A team object
     * @apiSuccess {id} Array.team.id Id of the team
     * @apiSuccess {string} Array.team.name Display name of the team
     * @apiSuccess {string} Array.team.group Group of team used for group messages
     * @apiSuccess {string} Array.team.location Location of the team in the buildings
     * @apiSuccess {string} Array.team.role Role of the team
     */
    // find(req, res) {}


    /**
     * @api {post} /team/create Create a team
     * @apiName create
     * @apiGroup Team
     * @apiDescription Create an team
     *
     * @apiParam {string} name Display name of the team (required)
     * @apiParam {string} group Group of team used for group messages (required)
     * @apiParam {string} location Location of the team in the buildings
     * @apiParam {string} role Role of the team (required)
     *
     * @apiSuccess {Team} team The team that you've juste created
     *
     * @apiUse badRequestError
     * @apiUse forbiddenError
     */
    // create(req, res) {}

    /**
     * @api {put} /team/:id Update a team
     * @apiName update
     * @apiGroup Team
     * @apiDescription Update the given team
     *
     * @apiParam {string} id Id of the team you want to edit
     * @apiParam {string} name Display name of the team (required)
     * @apiParam {string} group Group of team used for group messages (required)
     * @apiParam {string} location Location of the team in the buildings
     * @apiParam {string} role Role of the team (required)
     *
     * @apiSuccess {Team} team The team that you've juste updated
     *
     * @apiUse badRequestError
     * @apiUse forbiddenError
     * @apiUse notFoundError
     */
    // update(req, res) {}


    /**
     * @api {delete} /team/:id Delete an team
     * @apiName destroy
     * @apiGroup Team
     * @apiDescription Delete the given team
     *
     * @apiParam {string} id Id of the team you want to delete
     *
     * @apiUse badRequestError
     * @apiUse forbiddenError
     * @apiUse notFoundError
     */
    // destroy(req, res) {}
}

module.exports = TeamController;
