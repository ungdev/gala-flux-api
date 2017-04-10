const Url = require('url');


/**
 * UserController
 *
 * @description Create, update and delte User object
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


module.exports = {

    /**
     * @api {get} /user/find Find all users and subscribe to them
     * @apiName find
     * @apiGroup User
     * @apiDescription Get the list of all users.
     *
     * @apiUse forbiddenError
     *
     * @apiSuccess {Array} Array An array of user
     * @apiSuccess {User} Array.user An user object
     * @apiSuccess {string} Array.user.login Login of EtuUTT user
     * @apiSuccess {string} Array.user.ip IP of IP user
     * @apiSuccess {string} Array.user.name Display name of the user
     * @apiSuccess {id} Array.user.team Associated team ID
     */
    find: function (req, res) {
        if(Team.can(req, 'user/read')
        || Team.can(req, 'user/admin')) {
            User.find()
            .exec((error, user) => {
                if (error) {
                    return res.negotiate(error);
                }

                User.subscribe(req, _.pluck(user, 'id'));
                User.watch(req);

                return res.ok(user);
            });
        }
        else {
            return res.error(403, 'forbidden', 'You are not authorized read user list');
        }
    },


    /**
     * @api {get} /user/find/:id Find one user
     * @apiName findOne
     * @apiGroup User
     * @apiDescription Find one user from its id.
     * Even if you have no permission, you can always read your own object.
     *
     * @apiUse forbiddenError
     * @apiUse notFoundError
     *
     * @apiParam {string} id Id of the user you want to see
     *
     * @apiSuccess {User} user An user object
     * @apiSuccess {string} user.login Login of EtuUTT user
     * @apiSuccess {string} user.ip IP of IP user
     * @apiSuccess {string} user.name Display name of the user
     * @apiSuccess {id} user.team Associated team ID
     */
    findOne: function (req, res) {
        if(Team.can(req, 'user/read')
        || Team.can(req, 'user/admin')
        || req.param('id') == req.user.id) {
            User.findOne({id: req.param('id')})
            .exec((error, user) => {
                if (error) {
                    return res.negotiate(error);
                }
                if(!user) {
                    return res.error(404, 'notfound', 'The requested user cannot be found');
                }

                User.subscribe(req, [req.param('id')]);

                return res.ok(user);
            });
        }
        else {
            return res.error(403, 'forbidden', 'You are not authorized read user data');
        }
    },


    /**
     * @api {post} /user/create Create an user
     * @apiName create
     * @apiGroup User
     * @apiDescription Create an user
     *
     * @apiParam {string} login Login of EtuUTT user (required if `ip` empty, but has to be empty if `ip` is filled)
     * @apiParam {string} ip IP of IP user (required if `login` empty, but has to be empty if `login` is filled)
     * @apiParam {string} name Display name of the user (required)
     * @apiParam {id} team Associated team ID (required)
     *
     * @apiSuccess {User} user The user that you've juste created
     *
     * @apiUse badRequestError
     * @apiUse forbiddenError
     */
    create: function (req, res) {
        // Check permissions
        if(!Team.can(req, 'user/admin') && !(Team.can(req, 'user/team') && req.param('team') == req.team.id)) {
            return res.error(403, 'forbidden', 'You are not authorized to create another user in this team.');
        }

        // Check parameters
        if(!req.param('login') && !req.param('ip')) {
            return res.error(400, 'BadRequest', 'Either `ip` or `login` field has to be set.');
        }
        else if(req.param('login') && req.param('ip')) {
            return res.error(400, 'BadRequest', 'Either `ip` or `login` has to be empty.');
        }
        Team.findOne({id: req.param('team')}).exec((error, team) => {
            if(!team) {
                return res.error(400, 'BadRequest', 'Team id is not valid.');
            }

            // Create user
            let user = {};
            if(req.param('login')) user.login = req.param('login');
            if(req.param('ip')) user.ip = req.param('ip');
            if(req.param('name')) user.name = req.param('name');
            if(req.param('team')) user.team = req.param('team');

            User.create(user).exec((error, user) => {
                if (error) {
                    return res.negotiate(error);
                }

                User.publishCreate(user);
                User.subscribe(req, [user.id]);

                return res.ok(user);
            });
        })
    },

    /**
     * @api {put} /user/:id Update an user
     * @apiName update
     * @apiGroup User
     * @apiDescription Update the given user
     *
     * @apiParam {id} id Id of the user you want to edit
     * @apiParam {string} login Login of EtuUTT user (required if `ip` empty, but has to be empty if `ip` is filled)
     * @apiParam {string} ip IP of IP user (required if `login` empty, but has to be empty if `login` is filled)
     * @apiParam {string} name Display name of the user (required)
     * @apiParam {id} team Associated team ID (required)
     *
     * @apiSuccess {User} user The user that you've juste updated
     *
     * @apiUse badRequestError
     * @apiUse forbiddenError
     * @apiUse notFoundError
     */
    update: function (req, res) {
        // Check permissions 1
        if(!Team.can(req, 'user/admin') && !(Team.can(req, 'user/team'))) {
            return res.error(403, 'forbidden', 'You are not authorized to update an user.');
        }

        // Check parameters
        if(req.param('login') && req.param('ip')) {
            return res.error(400, 'BadRequest', 'Either `ip` or `login` has to be empty.');
        }

        // Find user
        User.findOne({id: req.param('id')})
        .exec((error, user) => {
            if (error) {
                return res.negotiate(error);
            }
            if(!user) {
                return res.error(404, 'notfound', 'The requested user cannot be found');
            }

            // Check permissions 2
            if(Team.can(req, 'user/team') && user.team != req.team.id) {
                return res.error(403, 'forbidden', 'You are not authorized to update an user from this team.');
            }
            else if(Team.can(req, 'user/team') && req.param('team') && req.param('team') != req.team.id) {
                return res.error(403, 'forbidden', 'You are not authorized to change the team of your user.');
            }


            // Update
            user.login = req.param('login', user.login);
            user.ip = req.param('ip', user.ip);
            user.name = req.param('name', user.name);
            user.team = req.param('team', user.team);

            // Check team
            Team.findOne({id: user.team}).exec((error, team) => {
                if(!team && req.param('team')) {
                    return res.error(400, 'BadRequest', 'Team id is not valid.');
                }

                user.save((error) => {
                    if (error) {
                        return res.negotiate(error);
                    }

                    User.publishUpdate(user.id, user);
                    User.subscribe(req, [user.id]);

                    return res.ok(user);
                });
            });
        });
    },


    /**
     * @api {delete} /user/:id Delete an user
     * @apiName destroy
     * @apiGroup User
     * @apiDescription Delete the given user
     *
     * @apiParam {id} id Id of the user you want to delete
     *
     * @apiUse badRequestError
     * @apiUse forbiddenError
     * @apiUse notFoundError
     */
    destroy: function (req, res) {
        // Check permissions 1
        if(!Team.can(req, 'user/admin') && !(Team.can(req, 'user/team'))) {
            return res.error(403, 'forbidden', 'You are not authorized to update an user.');
        }

        // Find user
        User.findOne({id: req.param('id')})
        .exec((error, user) => {
            if (error) {
                return res.negotiate(error);
            }
            if(!user) {
                return res.error(404, 'notfound', 'The requested user cannot be found');
            }

            // Check permissions 2
            if(Team.can(req, 'user/team') && user.team != req.team.id) {
                return res.error(403, 'forbidden', 'You are not authorized to delete an user from this team.');
            }

            User.destroy({id: user.id}).exec((error) => {
                if (error) {
                    return res.negotiate(error);
                }

                User.publishDestroy(user.id);

                return res.ok();
            });
        });
    },




    /**
     * @api {get} /user/etuutt Search for an user from the etuutt database
     * @apiName etuuttFind
     * @apiGroup User
     *
     * @apiDescription Search from partial fullname in the etuutt db and return a list
     * of 25 matched user with informations which can be usefull to create a new user.
     * User that call this request has to be logged vie EtuUTT.
     *
     * @apiParam {string} search Search string : part of name, login, or student id

     * @apiError EtuUTTNotConfigured The server is not configured for the API of EtuUTT
     * @apiErrorExample EtuUTTNotConfigured
     *     HTTP/1.1 501 Not Implemented
     *     {
     *         "_error": {
     *             code: 501,
     *             status: 'EtuUTTNotConfigured',
     *             message: 'The server is not configured for the API of EtuUTT'
     *         }
     *     }

     * @apiError EtuUTTError An error occurs during communications with the api of EtuUTT
     * @apiErrorExample EtuUTTError
     *     HTTP/1.1 503 Service Unavailable
     *     {
     *         "_error": {
     *             code: 503,
     *             status: 'EtuUTTError',
     *             message: 'An error occurs during communications with the api of EtuUTT'
     *         }
     *     }
     *
     *
     * @apiError NotEtuuttUser Authenticated user is not logged in via EtuUTT
     * @apiErrorExample LoginNotFound
     *     HTTP/1.1 403 Unauthorized
     *     {
     *         "_error": {
     *             code: 403,
     *             status: 'NotEtuuttUser',
     *             message: 'Authenticated user is not logged in via EtuUTT'
     *         }
     *     }
     *
     * @apiUse badRequestError
     */
    etuuttFind: function (req, res) {
        console.log('hello')
        if (!sails.config.etuutt.id
            || !sails.config.etuutt.secret
            || !sails.config.etuutt.baseUri) {
            return res.error(501, 'EtuUTTNotConfigured', 'The server is not configured for the API of EtuUTT');
        }

        if(!req.user.accessToken || !req.user.refreshToken || !req.user.login) {
            return res.error(403, 'NotEtuuttUser', 'Authenticated user is not logged in via EtuUTT.');
        }

        if(!req.param('search')) {
            return res.error(400, 'BadRequest', 'Search field is missing.');
        }

        let EtuUTT = EtuUTTService(req.user);
        let out = [];
        EtuUTT.publicUsers({multifield: req.param('search')})
        .then((data) => {
            // Filter user informations
            if(data.data && Array.isArray(data.data)) {
                for (let user of data.data) {
                    // find user official image link
                    let etuuttLink = Url.parse(sails.config.etuutt.baseUri);
                    etuuttLink = etuuttLink.protocol + '//' + etuuttLink.host;
                    let imageLink = null;
                    if(user._links && Array.isArray(user._links)) {
                        for (let link of user._links) {
                            if(link.rel == 'user.image') {
                                imageLink = etuuttLink + link.uri;
                            }
                            else if(link.rel == 'user.official_image') {
                                imageLink = etuuttLink + link.uri;
                                break;
                            }
                        }
                    }

                    // Add to output
                    out.push({
                        login: user.login,
                        name: user.fullName,
                        image: imageLink,
                    })
                }
                return res.ok(out);
            }

            return res.error(500, 'EtuUTTError', 'Unexpected EtuUTT answer format');
        })
        .catch((error) => {
            console.log(error);
            return res.error(500, 'EtuUTTError', 'An error occurs during communications with the api of EtuUTT: ' + error);
        })
    },
};
