/**
 * BottleActionController
 *
 * @description :: Server-side logic for managing BottleActions
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    /**
     * @api {get} /bottleAction/find Find all bottles actions related to the bar and subscribe to them
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
        if((Team.can(req, 'bottleAction/read') && Team.param('id') == req.team('id')) ||
            Team.can(req, 'bottleAction/admin')) {
            BottleAction.find()
                .exec((error, bottleAction) => {
                    if (error) {
                        return res.negotiate(error);
                    }

                    if(!(Team.can(req, 'bottleAction/admin'))) {
                        let channel = 'BottleAction/' + req.team.id;
                        sails.sockets.join(channel);
                        return res.ok(botleAction);
                    }
                    else {
                        BottleAction.watch(req);
                        return res.ok(bottleAction);
                    }
                })
        }
        else {
            return res.error(403, 'forbidden', 'You are not authorized to view the bottle actions list.');
        }
    },


    /**
     * @api {get} /bottleaction/find/:id Find one bottle action
     * @apiName findOne
     * @apiGroup BottleAction
     * @apiDescription Find one bottle action based on its id
     *
     * @apiUse forbiddenError
     * @apiUse notFoundError
     *
     * @apiParam {id} id Id of the bottle action you are looking for
     *
     * @apiSuccess {BottleAction} Array.bottleAction A bottle action object
     * @apiSuccess {string} Array.bottle.team Team which produced a bottle action
     * @apiSuccess {string} Array.bottle.bottleId Id of the concerned bottle
     * @apiSuccess {integer} Array.bottle.quantity Number of bottles sold or moved (can be negative)
     * @apiSuccess {string} Array.bottle.operation Operation performed on the bottle (sold or moved)
     */

    findOne: function (req, res) {
        // Check permissions
        if(Team.can(req, 'bottleAction/read') || Team.can(req, 'bottleAction/admin')) {

            // Find bottleAction
            BottleAction.findOne({id: req.param('id')})
                .exec((error, bottleAction) => {
                    if (error) {
                        return res.negotiate(error);
                    }
                    if(!bottleAction) {
                        return res.error(400, 'BadRequest', 'The requested bottle action cannot be found');
                    }

                    BottleAtion.subscribe(req, [req.param('id')]);

                    return res.ok(bottleAction);
                });
        }
        else {
            return res.error(403, 'forbidden', 'You are not authorized to read bottle action data');
        }
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

                    let data = {
                        verb: 'created',
                        id: bottleAction.id,
                        data: bottleAction,
                    };
                    
                    sails.sockets.broadcast('BottleAction/' + bottleAction.id, 'BottleAction', data);
                    BottleAction.publishCreate(bottleAction);

                    return res.ok(bottleAction);
                });
            })
        }
    },
};

