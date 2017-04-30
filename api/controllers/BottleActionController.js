/**
 * BottleActionController
 *
 * @description :: Server-side logic for managing BottleActions
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    /**
     * @api {post} /bottleAction/subscribe Subscribe to new items
     * @apiName subscribe
     * @apiGroup BottleAction
     * @apiDescription Subscribe to all new items.
     */
    subscribe: function(req, res) {
        if(Team.can(req, 'bottleAction/read') || Team.can(req, 'bottleAction/admin')) {
            BottleAction.watch(req);
            BottleAction.find().exec((error, items) => {
                if(error) return res.negotiate(error);
                BottleAction.subscribe(req, _.pluck(items, 'id'));
                return res.ok();
            });
        }
        else if(Team.can(req, 'bottleAction/restricted')) {
            // Join only for update of it own bottles
            sails.sockets.join('BottleAction/' + req.team.id);
        }
        else {
            return res.ok();
        }
    },

    /**
     * @api {post} /bottleAction/unsubscribe Unsubscribe from new items
     * @apiName subscribe
     * @apiGroup BottleAction
     * @apiDescription Unsubscribe from new items
     */
    unsubscribe: function(req, res) {
        sails.sockets.leave('BottleAction/' + req.team.id);
        BottleAction.unwatch(req);
        BottleAction.find().exec((error, items) => {
            if(error) return res.negotiate(error);
            BottleAction.unsubscribe(req, _.pluck(items, 'id'));
            return res.ok();
        });
    },


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
     * @apiSuccess {string} Array.bottle.bottleId Id of the concerned bottle
     * @apiSuccess {integer} Array.bottle.quantity Number of bottles sold or moved (can be negative)
     * @apiSuccess {string} Array.bottle.operation Operation performed on the bottle (sold or moved)
     */

    find: function(req, res) {
        // Check permissions
        if (!(Team.can(req, 'bottleAction/admin') || Team.can(req, 'bottleAction/read') || Team.can(req, 'bottleAction/restricted'))) {
            return res.error(403, 'forbidden', 'You are not authorized to view the bottle actions list.');
        }

        // read filters
        let where = {};
        if (req.allParams().filters) {
            where = req.allParams().filters;
        }
        // if the requester is not admin, show only his team's bottleActions
        if (Team.can(req, 'bottleAction/restricted')) {
            where = {
                or: [{ team: req.team.id }, { fromTeam: req.team.id }],
                where,
            };
        }

        // Find bottleActions
        BottleAction.find(where)
            .exec((error, bottleActions) => {
                if (error) {
                    return res.negotiate(error);
                }

                return res.ok(bottleActions);
            });

    },

    /**
     * @api {post} /bottleaction/create Create a bottle action
     * @apiName create
     * @apiGroup BottleAction
     * @apiDescription Create a bottle action
     *
     * @apiParam {string} team Name of the team performing the bottle action
     * @apiParam {string} bottleId Id of the bottle
     * @apiParam {integer} quantity Number of bottles concerned (can be negative)
     * @apiParam {string} operation Operation performed on the bottle (purchased or moved)
     *
     * @apiSuccess {BottleAction} bottleAction The bottle action you've just created
     *
     * @apiUse badRequestError
     * @apiUse forbiddenError
     */

    create: function (req, res) {
        // Check permissions
        if(Team.can(req, 'bottleAction/create') || Team.can(req, 'bottleAction/admin')) {

            // find bottleAction
            BottleAction.findOne({id: req.param('id')}).exec((error, bottleAction) => {
                if (bottleAction) {
                    return res.error(400, 'BadRequest', 'Bottle action is not valid.');
                }

                // Create bottleAction
                bottleAction = {};
                if (req.param('team')) bottleAction.team = req.param('team');
                if (req.param('bottleId')) bottleAction.bottleId = req.param('bottleId');
                if (req.param('quantity')) bottleAction.quantity = req.param('quantity');
                if (req.param('operation')) bottleAction.operation = 'purchased';

                BottleAction.create(bottleAction).exec((error, bottleAction) => {
                    if (error) {
                        return res.negotiate(error);
                    }

                    return res.ok(bottleAction);
                });
            });
        }
    },
};
