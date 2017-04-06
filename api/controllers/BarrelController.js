/**
 * BarrelController
 *
 * @description :: Server-side logic for managing Barrels
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    /**
     * @api {get} /barrel
     * @apiName find
     * @apiGroup Barrel
     * @apiDescription Get the list of all barrel according to permissions.
     *
     * @apiSuccess {Array} An array of barrel
     *
     * @apiUse forbiddenError
     */
    find: (req, res) => {

        // Check permissions
        if (!(Team.can(req, 'barrel/admin') || Team.can(req, 'barrel/restricted'))) {
            return res.error(403, 'forbidden', 'You are not authorized to read barrels.');
        }

        // if the requester is not admin, show only his team's barrels
        let where = {};
        if (!(Team.can(req, 'barrel/admin'))) {
            where.place = req.team;
        }

        // Find barrels
        Barrel.find(where)
            .exec((error, barrels) => {
                if (error) {
                    return res.negotiate(error);
                }

                Barrel.subscribe(req, _.pluck(barrels, 'id'));
                Barrel.watch(req);

                return res.ok(barrels);
            });

    },

    /**
     * @api {put} /barrel/:id
     * @apiName update
     * @apiGroup Barrel
     * @apiDescription Update the given barrel
     *
     * @apiParam {string} id : Id of the barrel to edit (required)
     * @apiParam {string} state : The new barrel state (required)
     *
     * @apiSuccess {Barrel} The barrel that you've just updated
     *
     * @apiUse forbiddenError
     * @apiUse notFoundError
     */
    update: (req, res) => {

        const states = ["new", "opened", "empty"];

        // Check permissions
        if (!(Team.can(req, 'barrel/admin') || Team.can(req, 'barrel/restricted'))) {
            return res.error(403, 'forbidden', 'You are not authorized to update barrels.');
        }

        // check parameters
        if (!req.param('state')) {
            return res.error(400, 'BadRequest', "The parameter 'state' is required.");
        } else if (states.indexOf(req.param('state')) == -1) {
            return res.error(400, 'BadRequest', "Unknown value for the parameter 'state'.");
        }

        Barrel.findOne({id: req.param('id')})
            .exec((error, barrel) => {
                if (error) {
                    return res.negotiate(error);
                }
                if (!barrel) {
                    return res.error(404, 'notFound', 'The requested barrel cannot be found');
                }
                // if the requester is not admin, check if the barrel belongs to his team
                if (!Team.can(req, 'barrel/admin') && (req.team.id !== barrel.place)) {
                    return res.error(403, 'forbidden', 'You are not authorized to update this barrel.');
                }

                // check if the state can be set with this new value (next or previous state).
                // because it's not allowed to move from new to empty for example
                if (Math.abs(states.indexOf(barrel.state) - states.indexOf(req.param('state'))) !== 1) {
                    return res.error(400, 'BadRequest', "You are not allowed to set the state with this value.");
                }

                // save the new state
                barrel.state = req.param('state');
                barrel.save((error) => {
                    if (error) {
                        return res.negotiate(error);
                    }

                    // log the new barrel state
                    BarrelHistory.pushToHistory(barrel, (error, barrelHistory) => {
                        if (error) {
                            return res.negotiate(error);
                        }

                        Barrel.publishUpdate(barrel.id, barrel);
                        Barrel.subscribe(req, [barrel.id]);

                        return res.ok(barrel);

                    });
                });

            });

    }

};

