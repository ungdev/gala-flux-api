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
            sails.sockets.join(req, 'bottleAction/' + req.team.id, (error) => {
                if (error) return res.negotiate(error);
                return res.ok();
            });
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
        sails.sockets.leave(req, 'bottleAction/' + req.team.id, () => {
            BottleAction.unwatch(req);
            BottleAction.find().exec((error, items) => {
                if(error) return res.negotiate(error);
                BottleAction.unsubscribe(req, _.pluck(items, 'id'));
                return res.ok();
            });
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
     * @apiSuccess {string} Array.bottle.type Id of the concerned bottle
     * @apiSuccess {integer} Array.bottle.quantity Number of bottles sold or moved (can be negative)
     * @apiSuccess {string} Array.bottle.operation Operation performed on the bottle (sold or moved)
     */

    find: function(req, res) {
        // Check permissions
        if (!(Team.can(req, 'bottleAction/admin') || Team.can(req, 'bottleAction/read') || Team.can(req, 'bottleAction/restricted'))) {
            return res.error(req, 403, 'forbidden', 'You are not authorized to view the bottle actions list.');
        }

        // read filters
        let where = [];
        if (req.allParams().filters) {
            where = req.allParams().filters;
        }
        // if the requester is not admin, show only his team's bottleActions
        if (Team.can(req, 'bottleAction/restricted')) {
            // "or and or" is not possibile in waterline, so we ignore other filters
            where = [{ team: req.team.id }, { fromTeam: req.team.id }];
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
     * @api {get} /bottleAction/count Give the counts of bottles
     * @apiName find
     * @apiGroup BottleAction
     * @apiDescription Give the current number of bottle of each type for each team
     *
     * @apiUse forbiddenError
     */

    count: function(req, res) {
        // Check permissions
        if (!(Team.can(req, 'bottleAction/admin') || Team.can(req, 'bottleAction/read') || Team.can(req, 'bottleAction/restricted'))) {
            return res.error(req, 403, 'forbidden', 'You are not authorized to view the bottle count list.');
        }

        // read filters
        let where = {};
        // if the requester is not admin, show only his team's bottleActions
        if (Team.can(req, 'bottleAction/restricted')) {
            where = [{ team: req.team.id }, { fromTeam: req.team.id }];
        }

        // Find bottleTypes
        BottleType.find()
        .exec((error, bottleTypes) => {
            if (error) {
                return res.negotiate(error);
            }

            // Find bottleActions
            BottleAction.find(where)
            .exec((error, bottleActions) => {
                if (error) {
                    return res.negotiate(error);
                }

                // Init result object
                let result = {
                    null: {},
                };
                for (let type of bottleTypes) {
                    result[null][type.id] = {new: type.originalStock, empty: 0};
                }

                // Update it with actions
                for (let bottleAction of bottleActions) {
                    // Init team level
                    if(!result[bottleAction.team || null]) {
                        result[bottleAction.team || null] = {};
                    }
                    if(!result[bottleAction.fromTeam || null]) {
                        result[bottleAction.fromTeam || null] = {};
                    }

                    // Init bottleType level
                    if(!result[bottleAction.team || null][bottleAction.type]) {
                        result[bottleAction.team || null][bottleAction.type] = {new: 0, empty: 0};
                    }
                    if(!result[bottleAction.fromTeam || null][bottleAction.type]) {
                        result[bottleAction.fromTeam || null][bottleAction.type] = {new: 0, empty: 0};
                    }

                    // Update state entry
                    if(bottleAction.operation == 'purchased') {
                        result[bottleAction.team || null][bottleAction.type].new -= bottleAction.quantity;
                        result[bottleAction.team || null][bottleAction.type].empty += bottleAction.quantity;
                    }
                    else if(bottleAction.operation == 'moved') {
                        result[bottleAction.fromTeam || null][bottleAction.type].new -= bottleAction.quantity;
                        result[bottleAction.team || null][bottleAction.type].new += bottleAction.quantity;
                    }
                }

                return res.ok(result);
            });
        });
    },

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

    create: function (req, res) {
        // Check permissions
        if(Team.can(req, 'bottleAction/restricted') || Team.can(req, 'bottleAction/admin')) {

            // find bottleType
            BottleType.findOne({id: req.param('type')}).exec((error, bottleType) => {
                if (error) {
                    return res.negotiate(error);
                }
                if (!bottleType) {
                    return res.error(req, 400, 'BadRequest', 'Bottle type is not valid.');
                }

                // Check restricted permission
                if(Team.can(req, 'bottleAction/restricted')) {
                    if(req.param('team') != req.team.id || req.param('fromTeam') || req.param('operation') != 'purchased') {
                        return res.error(req, 400, 'BadRequest', "You are only allowed to update state of purchased bottle in you team.");
                    }
                }

                // Create bottleAction
                bottleAction = {};
                if (req.param('team')) bottleAction.team = req.param('team');
                if (req.param('fromTeam')) bottleAction.fromTeam = req.param('fromTeam');
                if (req.param('type')) bottleAction.type = req.param('type');
                if (req.param('quantity') !== undefined) bottleAction.quantity = req.param('quantity');
                if (req.param('operation')) bottleAction.operation = req.param('operation');

                BottleAction.create(bottleAction).exec((error, bottleAction) => {
                    if (error) {
                        return res.negotiate(error);
                    }

                    // Update alerts
                    BottleAction.checkForAlert(bottleAction.team, bottleType);
                    BottleAction.checkForAlert(bottleAction.fromTeam, bottleType);

                    return res.ok(bottleAction);
                });
            });
        }
    },
};
