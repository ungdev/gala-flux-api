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

        // read filters
        let where = {};
        if (req.allParams().filters) {
            where = req.allParams().filters;
        }
        // if the requester is not admin, show only his team's barrels
        if (!(Team.can(req, 'barrel/admin'))) {
            where.place = req.team.id;
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

        // check permissions and parameters
        if (Team.can(req, 'barrel/admin')) {
            // an admin can update both place and state
            if (req.param('state') === undefined && req.param('place') === undefined) {
                return res.error(400, 'BadRequest', "You must send attributes to update.");
            }
        } else if (Team.can(req, 'barrel/restricted')) {
            // can only update the barrel's state
            if (req.param('state') === undefined) {
                return res.error(400, 'BadRequest', "Missing barrel's state.");
            }
        } else if (!Team.can(req, 'barrel/admin')) {
            return res.error(403, 'forbidden', 'You are not authorized to update barrels.');
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

                // if the requester sent a new value for the 'state' attribute
                if (req.param('state') !== undefined) {
                    // check if the state can be set with this new value (next or previous state).
                    // because it's not allowed to move from new to empty for example
                    if (!isStateValid(req.param('state'), barrel.state)) {
                        return res.error(400, 'BadRequest', "You are not allowed to set the state with this value.");
                    }
                    // set the state
                    barrel.state = req.param('state');
                }

                // if admin and send a new value for the 'place' attribute
                if (req.param('place') !== undefined && Team.can(req, 'barrel/admin')) {
                    // the place can be null
                    if (req.param('place') === "null" || req.param('place') === null) {
                        barrel.place = null;
                        return updateBarrel(barrel, req, res);
                    }
                    // if not null, check if the team exists
                    Team.findOne({id: req.param('place')})
                        .exec((error, team) => {
                            if (error) {
                                return res.negotiate(error);
                            }
                            if(!team) {
                                return res.error(404, 'notfound', 'The requested team cannot be found');
                            }

                            // the team exists, save the barrel with this new place
                            barrel.place = team;
                            return updateBarrel(barrel, req, res);
                        });
                } else {
                    return updateBarrel(barrel, req, res);
                }

            });

    },

    /**
     * @api {delete} /barrel/:id
     * @apiName destroy
     * @apiGroup Barrel
     * @apiDescription Delete the given Barrel
     *
     * @apiParam {string} id : Id of the barrel to delete
     *
     * @apiUse forbiddenError
     * @apiUse notFoundError
     */
    destroy: function (req, res) {

        // Check permissions
        if(!Team.can(req, 'barrel/admin')) {
            return res.error(403, 'forbidden', 'You are not authorized to delete a barrel.');
        }

        // Find the barrel
        Barrel.findOne({id: req.param('id')})
            .exec((error, barrel) => {
                if (error) {
                    return res.negotiate(error);
                }
                if(!barrel) {
                    return res.error(404, 'notfound', 'The requested barrel cannot be found');
                }

                Barrel.destroy({id: barrel.id}).exec((error) => {
                    if (error) {
                        return res.negotiate(error);
                    }

                    Barrel.publishDestroy(barrel.id);

                    return res.ok();
                });
            });
    }

};

function updateBarrel(barrel, req, res) {

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
}

/**
 * If only the state is passed in parameter, check if
 * the value of state is valid (in the states array)
 *
 * If currentState too is set, check if it's allowed to move
 * from currentState to state.
 *
 * @param {string} state
 * @param {string|null} currentState
 * @returns {boolean}
 */
function isStateValid(state, currentState) {
    const states = ["new", "opened", "empty"];

    // if no current state, only check if state is in the array
    if (!currentState) {
        return states.indexOf(state) !== -1;
    } else {
        // return false if the state is wrong
        if (states.indexOf(state) === -1) {
            return false;
        }
    }

    // check if it's allowed to set the barrel state with this value (same or neighbor)
    const d = Math.abs(states.indexOf(currentState) - states.indexOf(state))
    return d === 1 || d === 0;
}
