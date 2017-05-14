/**
 * AuthController
 *
 * @description Authenticaiton logic and JWT generation
 *
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
 * @apiDefine jwtSuccess
 * @apiSuccess {String} jwt JWT (JSON Web Token) that you have to use
 * to authenticate against other API endpoints. Here is how to use it:
 * * For HTTP requests, you have to set an header `Authorization: Bearer [Your JWT token]`
 * * For Web socket requests, you are already authenticated after this method, because you JWT has been associated with your socket. But if you need to open a new socket with this JWT, you can authenticate with the `/auth/jwt` endpoint
 * @apiSuccessExample Success
 *     HTTP/1.1 200 OK
 *     {
 *       "jwt": "QnJhdm8sIHR1IGFzIGTDqWNvZMOpIGNlIGNv.ZGUgZW4gQmFzZTY0LCBqJ8Opc3DDqHJlIHF1ZSB0dSBlcyBmaWVyIGRlIHRvaSwgw6dhIG.4nYXJyaXZlIHBhcyB0b3VzIGxlcyBqb3VycyB0dSBzY"
 *     }
 */


module.exports = {

    /**
     * @api {post} /login/ip Authenticate user by IP
     * @apiName ipLogin
     * @apiGroup Authentication
     * @apiDescription Will try to authenticate with the IP used by the client
     * that send the request.
     *
     * @apiUse jwtSuccess
     *
     * @apiError IPNotFound There is no User associated with this IP
     * @apiErrorExample IPNotFound
     *     HTTP/1.1 401 Unauthorized
     *     {
     *         "_error": {
     *             code: 401,
     *             status: 'IPNotFound',
     *             message: 'There is no User associated with this IP'
     *         }
     *     }
     *
     */
    ipLogin: function (req, res) {
        User.attemptIpAuth((req.ip ? req.ip : req.socket.handshake.address), (err, user) => {
            if (err) {
                return res.negotiate(err);
            }
            if (!user) {
                return res.error(401, 'IPNotFound', 'There is no User associated with this IP');
            }
            let jwt = JwtService.sign(user);
            if(req.socket) {
                req.socket.jwt = jwt;
            }
            return res.ok({jwt});
        });
    },


    /**
     * @api {get} /login/oauth Initiate OAuth log in
     * @apiName oauthLogin
     * @apiGroup Authentication
     *
     * @apiDescription Initiate the OAuth 2.0 authentication with EtuUTT.
     * This method will generate
     * an URI where the user should be redirected.
     *
     * @apiSuccess {String} redirectUri The URI where the user should be redirected.
     *
     * @apiSuccessExample Success
     *     HTTP/1.1 200 OK
     *     {
     *       "redirectUri": "https://etu.utt.fr/api/oauth/authorize?client_id=0&scopes=public&response_type=code"
     *     }

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
     */
    oauthLogin: function (req, res) {
        if (!sails.config.etuutt.id
            || !sails.config.etuutt.secret
            || !sails.config.etuutt.baseUri) {
            return res.error(501, 'EtuUTTNotConfigured', 'The server is not configured for the API of EtuUTT');
        }

        let redirectUri = EtuUTTService().oauthAuthorize();

        return res.ok({redirectUri});
    },


    /**
     * @api {post} /login/oauth/submit Submit OAuth log in
     * @apiName oauthLoginSubmit
     * @apiGroup Authentication
     *
     * @apiDescription Submit the authorization_code of OAuth 2.0 for authentication with EtuUTT.
     * This method will check if the user is known and associated with a team.
     * If it is, a JWT will be returned.
     *
     * @apiParam {string} authorizationCode Authorization_code that you get after user redirection.
     *
     * @apiUse jwtSuccess

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
     * @apiError LoginNotFound There is no User associated with this login
     * @apiErrorExample LoginNotFound
     *     HTTP/1.1 401 Unauthorized
     *     {
     *         "_error": {
     *             code: 401,
     *             status: 'LoginNotFound',
     *             message: 'There is no User associated with this login'
     *         }
     *     }
     *
     * @apiUse badRequestError
     */
    oauthLoginSubmit: function (req, res) {
        if (!sails.config.etuutt.id
            || !sails.config.etuutt.secret
            || !sails.config.etuutt.baseUri) {
            return res.error(501, 'EtuUTTNotConfigured', 'The server is not configured for the API of EtuUTT');
        }

        if(!req.param('authorizationCode')) {
            return res.error(400, 'BadRequest', 'The parameter `authorizationCode` cannot be found.');
        }

        let EtuUTT = EtuUTTService();
        let tokenObj;

        EtuUTT.oauthTokenByAuthCode(req.param('authorizationCode'))
        .then((data) => {
            tokenObj = data;
            return EtuUTT.publicUserAccount();
        })
        .then((etuUTTUser) => {
            User.attemptLoginAuth(etuUTTUser.data.login, function (err, user) {
                if (err) {
                    return res.negotiate(err);
                }
                if (!user) {
                    return res.error(401, 'LoginNotFound', 'There is no User associated with this login');
                }

                // Update user data
                user.accessToken = tokenObj.access_token;
                user.refreshToken = tokenObj.refresh_token;
                user.tokenExpiration = tokenObj.expires_at;
                user.login = etuUTTUser.data.login;
                user.lastConnection = Date.now();
                if (!user.name) {
                    user.name = etuUTTUser.data.fullName;
                }

                user.save((error) => {
                    if (error) return res.negotiate(error);

                    AlertService.checkTeamActivity(user.team);
                });


                let jwt = JwtService.sign(user);
                if(req.socket) {
                    req.socket.jwt = jwt;
                }

                return res.ok({jwt});
            });
        })
        .catch((error) => {
            return res.error(500, 'EtuUTTError', 'An error occurs during communications with the api of EtuUTT: ' + error);
        })
    },

    /**
     * @api {post} /login/jwt Authenticate user by JWT
     * @apiName jwtLogin
     * @apiGroup Authentication
     * @apiDescription This endpoint can be used to renew
     * a yet-not-expired JWT. In socket communication, this endpoint
     * can also be used once to authenticate the whole socket connection.
     *
     * @apiParam {string} jwt A still valid JWT that you've taken from other auth method
     *
     * @apiUse jwtSuccess
     * @apiUse badRequestError
     *
     * @apiError InvalidJwt The given JWT is not valid
     * @apiErrorExample InvalidJwt
     *     HTTP/1.1 401 Unauthorized
     *     {
     *         "_error": {
     *             code: 401,
     *             status: 'InvalidJwt',
     *             message: 'The given JWT is not valid'
     *         }
     *     }
     *
     */
     jwtLogin: function (req, res) {
         if(!req.param('jwt')) {
             return res.error(400, 'BadRequest', 'The parameter `jwt` cannot be found.');
         }

        JwtService.verify(req.param('jwt'))
        .then((user) => {
            let jwt = JwtService.sign(user);
            if(req.socket) {
                req.socket.jwt = jwt;
            }

            return res.ok({jwt});
        })
        .catch((error) => {
            return res.error(500, 'InvalidJwt', 'The given JWT is not valid : ' + error);
        })
    },

    /**
     * @api {post} /login/as/:id Auth as another user
     * @apiName loginAs
     * @apiGroup Authentication
     * @apiDescription Will generate and authenticate with JWT token as another
     * user for debugging and testing purposes. Warning: the current user
     * for connection will be replaced.
     *
     * @apiParam {string} id The id of the user you want to authenticate
     *
     * @apiUse jwtSuccess
     *
     * @apiError IdNotFound There is no User associated with this id
     * @apiErrorExample IdNotFound
     *     HTTP/1.1 401 Unauthorized
     *     {
     *         "_error": {
     *             code: 401,
     *             status: 'IdNotFound',
     *             message: 'There is no User associated with this id'
     *         }
     *     }
     *
     */
    loginAs: function (req, res) {
        // Check permissions
        if(!Team.can(req, 'auth/as')) {
            return res.error(403, 'forbidden', 'You are not authorized to log in as someone else.');
        }

        User.findOne({
            id: req.param('id'),
        })
        .exec((error, user) => {
            if (error) {
                return res.negotiate(error);
            }
            if (!user) {
                return res.error(401, 'IdNotFound', 'There is no User associated with this id');
            }
            let jwt = JwtService.sign(user);
            if(req.socket) {
                req.socket.jwt = jwt;
            }
            return res.ok({jwt});
        });
    },

    /**
     * @api {get} /login/roles Get roles config
     * @apiName getRoles
     * @apiGroup Authentication
     * @apiDescription Will give the roles list associated with permissions
     *
     * @apiSuccess {String} roles The roles object
     * @apiSuccessExample Success
     *     HTTP/1.1 200 OK
     *     {
                bar: [
                    'message/oneChannel',
                ],
                log: [
                    'message/public',
                    'message/group',
                ]
     *     }
     *
     */
    getRoles: function (req, res) {
        return res.ok(sails.config.roles);
    },

    /**
     * @api {post} /logout Inform that a user is disconnected
     * @apiName logout
     * @apiGroup Authentication
     * @apiDescription Will give the disconnected user
     */
    logout: function (req, res) {
        const err = Session.handleLogout(req.socket.id);
        return err ? res.negotiate(err) : res.ok();
    }
};
