/**
 * TeamController
 *
 * @description Create, update and delete Team object
 */

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

let interval = null
let buckless = null
try{
  buckless = new BucklessService()
}
catch(e){
  console.log(e)
}
module.exports = {
    /**
     * @api {post} /team/subscribe Subscribe to new items
     * @apiName subscribe
     * @apiGroup Team
     * @apiDescription Subscribe to all new items.
     */
    subscribe: function(req, res) {
        if (Team.can(req, 'team/read') || Team.can(req, 'team/admin')) {
            Team.watch(req)
            Team.find().exec((error, items) => {
                if (error) return res.negotiate(error)
                Team.subscribe(req, _.pluck(items, 'id'))
                return res.ok()
            })
        } else {
            Team.subscribe(req, [req.team.id])
            return res.ok()
        }
        if (!interval) {
            interval = setInterval(() => {
                Team.find().exec((error, teams) => {
                    if (error) {
                        console.log(error)
                        return
                    }
                    if(sails.config.buckless.mail && sails.config.buckless.password){
                      teams.forEach(team => {
                          if (team.point) {
                              //request @ buckless with team.point
                            buckless
                                  .getPurchases(team.point)
                                  .then(result => {
                                      team.stats = JSON.stringify(result)
                                      team.save(error => {
                                          if (error) {
                                              console.log(error)
                                          }
                                      })
                                  })
                                  .catch((err) => {
                                    console.log(err.body)
                                  })
                          }
                      })
                    }
                })
            }, 5000)
        }
    },

    /**
     * @api {post} /team/unsubscribe Unsubscribe from new items
     * @apiName subscribe
     * @apiGroup Team
     * @apiDescription Unsubscribe from new items
     */
    unsubscribe: function(req, res) {
        Team.unwatch(req)
        Team.find().exec((error, items) => {
            if (error) return res.negotiate(error)
            Team.unsubscribe(req, _.pluck(items, 'id'))
            return res.ok()
        })
    },

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
    find: function(req, res) {
        // check permissions
        if (!(Team.can(req, 'team/read') || Team.can(req, 'team/admin'))) {
            return res.error(
                req,
                403,
                'forbidden',
                'You are not authorized read team list'
            )
        }

        // read filters
        let where = {}
        if (req.allParams().filters) {
            where = req.allParams().filters
        }

        Team.find(where).exec((error, team) => {
            if (error) {
                return res.negotiate(error)
            }

            return res.ok(team)
        })
    },

    /**
     * @api {get} /team/find/:id Find one team
     * @apiName findOne
     * @apiGroup Team
     * @apiDescription Find one team from its id.
     * Even if you have no permission, you can always read your own team.
     *
     * @apiUse forbiddenError
     * @apiUse notFoundError
     *
     * @apiParam {string} id Id of the team you want to see
     *
     * @apiSuccess {Team} team A team object
     * @apiSuccess {id} team.id Id of the team
     * @apiSuccess {string} team.name Display name of the team
     * @apiSuccess {string} team.group Group of team used for group messages
     * @apiSuccess {string} team.location Location of the team in the buildings
     * @apiSuccess {string} team.role Role of the team
     */
    findOne: function(req, res) {
        if (
            Team.can(req, 'team/read') ||
            Team.can(req, 'team/admin') ||
            req.param('id') == req.team.id
        ) {
            Team.findOne({ id: req.param('id') }).exec((error, team) => {
                if (error) {
                    return res.negotiate(error)
                }
                if (!team) {
                    return res.error(
                        req,
                        404,
                        'notfound',
                        'The requested team cannot be found'
                    )
                }

                return res.ok(team)
            })
        } else {
            return res.error(
                req,
                403,
                'forbidden',
                'You are not authorized read team data'
            )
        }
    },

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
    create: function(req, res) {
        // Check permissions
        if (!Team.can(req, 'team/admin')) {
            return res.error(
                req,
                403,
                'forbidden',
                'You are not authorized to create a team.'
            )
        }

        // Check parameters
        if (
            !req.param('role') ||
            !Array.isArray(sails.config.roles[req.param('role')])
        ) {
            return res.error(req, 400, 'UnknownRole', 'Unknown role.')
        }

        // Create team
        let team = {}
        if (req.param('name')) team.name = req.param('name')
        if (req.param('group')) team.group = req.param('group')
        if (req.param('location')) team.location = req.param('location')
        if (req.param('role')) team.role = req.param('role')
        if (req.param('point')) team.point = req.param('point')
        Team.create(team).exec((error, team) => {
            if (error) {
                return res.negotiate(error)
            }
            return res.ok(team)
        })
    },

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
    update: function(req, res) {
        // Check permissions
        if (!Team.can(req, 'team/admin')) {
            return res.error(
                req,
                403,
                'forbidden',
                'You are not authorized to update a team.'
            )
        }

        // Check parameters
        if (
            req.param('role') &&
            !Array.isArray(sails.config.roles[req.param('role')])
        ) {
            return res.error(req, 400, 'BadRequest', 'Unknown role.')
        }

        // Find team
        Team.findOne({ id: req.param('id') }).exec((error, team) => {
            if (error) {
                return res.negotiate(error)
            }
            if (!team) {
                return res.error(
                    req,
                    404,
                    'notfound',
                    'The requested team cannot be found'
                )
            }

            // Update
            team.name = req.param('name', team.name)
            team.group = req.param('group', team.group)
            team.location = req.param('location', team.location)
            team.role = req.param('role', team.role)
            team.point = req.param('point', team.point)

            team.save(error => {
                if (error) {
                    return res.negotiate(error)
                }
                return res.ok(team)
            })
        })
    },

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
    destroy: function(req, res) {
        // Check permissions
        if (!Team.can(req, 'team/admin')) {
            return res.error(
                req,
                403,
                'forbidden',
                'You are not authorized to delete a team.'
            )
        }

        // Find team
        Team.findOne({ id: req.param('id') }).exec((error, team) => {
            if (error) {
                return res.negotiate(error)
            }
            if (!team) {
                return res.error(
                    req,
                    404,
                    'notfound',
                    'The requested team cannot be found'
                )
            }

            Team.destroy({ id: team.id }).exec(error => {
                if (error) {
                    return res.negotiate(error)
                }

                return res.ok()
            })
        })
    }
}
