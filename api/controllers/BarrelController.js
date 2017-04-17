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

        let checkState = false;

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
                    // check if an alert has to be sent or removed
                    if ((barrel.state === "new" && req.param("state") === "opened") || (barrel.state === "opened" && req.param("state") === "new")) {
                        checkState = true;
                    }
                    // set the state
                    barrel.state = req.param('state');
                }

                // if admin and send a new value for the 'place' attribute
                if (req.param('place') !== undefined && Team.can(req, 'barrel/admin')) {
                    // the place can be null
                    if (req.param('place') === "null" || req.param('place') === null) {
                        barrel.place = null;
                        return updateBarrel(barrel, req, res, checkState);
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
                            return updateBarrel(barrel, req, res, checkState);
                        });
                } else {
                    return updateBarrel(barrel, req, res, checkState);
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
    },

    /**
     * @api {put} /barrel/location
     * @apiName updateLocation
     * @apiGroup Barrel
     * @apiDescription update the location of a list of barrels
     *
     * @apiParam {Array} barrels: The barrels to update
     * @apiParem {string} location: the new location
     *
     * @apiUse forbiddenError
     * @apiUse notFoundError
     */
    setLocation: function (req, res) {

        // check permissions
        if (!(Team.can(req, 'barrel/admin'))) {
            return res.error(403, 'forbidden', "You are not authorized to update barrels's location.");
        }

        // check team
        Team.findOne({id: req.param('location')})
            .exec((error, team) => {
                if (error) return res.negotiate(error);

                // if the location is not the log (null) and the asked team can't be found, return error
                if (req.param('location') !== null && req.param('location') !== "null" && !team) {
                    return res.error(403, 'forbidden', "The location is not valid.");
                }

                // prepare each update
                let promises = [];
                for (let i in req.param('barrels')) {
                    promises.push(new Promise((resolve, reject) => {
                        Barrel.findOne({id: req.param('barrels')[i].id})
                            .then(barrel => {
                                // update his location and save it
                                barrel.place = req.param('location');
                                barrel.save(error => {
                                    if (error) return reject(error);

                                    // log the barrel state
                                    BarrelHistory.pushToHistory(barrel, (error, barrelHistory) => {
                                        if (error) return reject(error);

                                        Barrel.publishUpdate(barrel.id, barrel);

                                        checkTeamStocks(barrel);

                                        return resolve(barrel.id);

                                    });
                                })
                            })
                            .catch(error => reject(error));
                    }));
                }

                // run all promises
                Promise.all(promises)
                    .then(ids => {

                        Barrel.subscribe(req, ids);

                        return res.ok();
                    })
                    .catch(error => res.negotiate(error));
            });

    }

};

/**
 * Check the remaining barrels of this type for the concerned bar.
 * If 1 : send warning alert
 * If 0 : send serious alert
 *
 * @param barrel
 */
function checkTeamStocks(barrel) {

    // if there is a team, get all his barrels of this type
    if (barrel.place) {

        BarrelType.findOne({
            id: barrel.type
        })
            .exec((error, type) => {
                if (error) return;

                // count how many new barrel of this type this the team still have
                Barrel.count({
                    place: barrel.place,
                    type: type.id,
                    state: "new"
                })
                    .exec((error, count) => {
                        if (error) return;

                        // if state is new, check if there is an alert to remove (if a missClick triggered an alert)
                        if (barrel.state === "new") {
                            // count how many barrels are news
                            // if 2 or 1, an alert was created
                            if (count < 3) {
                                // Find the alert sent
                                Alert.findOne({
                                    severity: count === 2 ? "warning" : "serious",
                                    category: "Manque auto",
                                    sender: barrel.place
                                })
                                    .limit(1).sort({$natural:-1})
                                    .exec((error, alert) => {
                                        if (error || !alert) return;

                                        Alert.destroy({id: alert.id}).exec((error) => {
                                            if (error) return;

                                            Alert.publishDestroy(alert.id);
                                        });
                                    });
                            }
                        } else {
                            // if 1 or 0 remaining, create alert
                            if (count < 2) {
                                Alert.create({
                                    sender: barrel.place,
                                    severity: count === 1 ? "warning" : "serious",
                                    title: "Stock : " + type.name,
                                    category: "Manque auto"
                                })
                                    .exec((error, alert) => {
                                        if (error) return;

                                        // push this modification in the alert history
                                        AlertHistory.pushToHistory(alert, (error, result) => {
                                            if (error) return;

                                            Alert.publishCreate(alert);
                                            Alert.subscribe(req, [alert.id]);
                                        });

                                    });
                            }
                        }
                    })

            });
    }
}

/**
 * Save a barrel and push it to the history
 *
 * @param {object} barrel: the barrel to save
 * @param {object} req: the request
 * @param {object} res: the response
 * @param {boolean} checkState: true if the barrel's team stocks have to be check
 */
function updateBarrel(barrel, req, res, checkState) {

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

            if (checkState) {
                checkTeamStocks(barrel);
            }

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
