const Flux = require('../../Flux');
const SessionService = require('../services/SessionService');
const { ExpectedError, BadRequestError, ForbiddenError, NotFoundError } = require('../../lib/Errors');
const EtuUTTService = require('../services/EtuUTTService');

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


class AuthController {

    /**
     * @api {post} /auth/ip Authenticate user by IP
     * @apiName ipLogin
     * @apiGroup Authentication
     * @apiDescription Will try to authenticate with the IP used by the client
     * that send the request.
     *
     * @apiParam {string} deviceId If smartphone app, deviceId is required
     * @apiParam {string} firebaseToken If smartphone app, firebaseToken is required
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
    ipLogin(req, res) {
        Flux.User.find({ where: {ip: req.ip} })
        .then(user => {
            if (!user) {
                throw new ExpectedError(401, 'IPNotFound', 'There is no User associated with this IP');
            }

            // Create session
            return SessionService.create(user, req.ip, req.socket, req.data.deviceId, req.data.firebaseToken);
        })
        .then(jwt => {
            res.ok({jwt});
        })
        .catch(res.error);
    }


    /**
     * @api {get} /auth/oauth Initiate OAuth log in
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
     oauthLogin(req, res) {
        if (!Flux.config.etuutt.id
            || !Flux.config.etuutt.secret
            || !Flux.config.etuutt.baseUri) {
            throw new ExpectedError(501, 'EtuUTTNotConfigured', 'The server is not configured for the API of EtuUTT');
        }

        let redirectUri = EtuUTTService().oauthAuthorize();

        return res.ok({redirectUri});
    }


    /**
     * @api {post} /auth/oauth/submit Submit OAuth log in
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
     oauthLoginSubmit(req, res) {
        if (!Flux.config.etuutt.id
            || !Flux.config.etuutt.secret
            || !Flux.config.etuutt.baseUri) {
            throw new ExpectedError(501, 'EtuUTTNotConfigured', 'The server is not configured for the API of EtuUTT');
        }

        if(!req.data.authorizationCode) {
            throw new BadRequestError('The parameter `authorizationCode` cannot be found.');
        }

        let EtuUTT = EtuUTTService();
        let tokenObj;

        EtuUTT.oauthTokenByAuthCode(req.data.authorizationCode)
        .then((data) => {
            tokenObj = data;
            return EtuUTT.publicUserAccount();
        })
        .then((etuttUser) => {
            // Find user associated witht this login
            return Flux.User.findOne({ where: {
                login: etuttUser.data.login,
            }});
        })
        .then((user) => {
            if (!user) {
                throw new ExpectedError(401, 'LoginNotFound', 'There is no User associated with this login');
            }

            // Update user data
            user.accessToken = tokenObj.access_token;
            user.refreshToken = tokenObj.refresh_token;
            user.tokenExpiration = tokenObj.expires_at;
            return user.save();
        })
        .then((user) => {
            // Create session
            return SessionService.create(user, req.ip, req.socket, req.data.deviceId, req.data.firebaseToken);
        })
        .then(jwt => {
            res.ok({jwt});
        })
        .catch(res.error);
    }

    /**
     * @api {post} /auth/jwt Authenticate user by JWT
     * @apiName jwtLogin
     * @apiGroup Authentication
     * @apiDescription This endpoint can be used to renew
     * a yet-not-expired JWT. In socket communication, this endpoint
     * can also be used once to authenticate the whole socket connection.
     *
     * @apiParam {string} jwt A still valid JWT that you've taken from other auth method
     * @apiParam {string} deviceId If smartphone app, deviceId is required
     * @apiParam {string} firebaseToken If smartphone app, firebaseToken is required
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
     jwtLogin(req, res) {
        if(!req.data.jwt) {
            throw new BadRequestError('The parameter `jwt` cannot be found.');
        }

        let sessionId = null;
        SessionService.check(req.data.jwt)
        .then((decoded) => {
            sessionId = decoded.sessionId;

            // Find user
            return Flux.User.findOne({
                where: { id: decoded.userId },
            });
        })
        .then((user) => {
            // Create session
            return SessionService.create(user, req.ip, req.socket, req.data.deviceId, req.data.firebaseToken, sessionId);
        })
        .then(jwt => {
            res.ok({jwt});
        })
        .catch(res.error);
    }

    /**
     * @api {post} /auth/as/:id Auth as another user
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
     loginAs(req, res) {
        // Check permissions
        if(!req.team.can('auth/as')) {
            throw new ForbiddenError('You are not authorized to log in as someone else.');
        }

        Flux.User.findById(req.data.id)
        .then((user) => {
            if (!user) {
                throw new NotFoundError(401, 'LoginNotFound', 'There is no User associated with this id');
            }

            // Create session
            return SessionService.create(user, req.ip, req.socket, req.data.deviceId, req.data.firebaseToken);
        })
        .then(jwt => {
            res.ok({jwt});
        })
        .catch(res.error);
    }

    /**
     * @api {get} /auth/roles Get roles config
     * @apiName getRoles
     * @apiGroup Authentication
     * @apiDescription Will give the roles list associated with permissions
     *
     * @apiSuccess {String} roles The roles object
     * @apiSuccessExample Success
     *     HTTP/1.1 200 OK
     *     {
     *           bar: [
     *               'message/oneChannel',
     *           ],
     *           log: [
     *               'message/public',
     *               'message/group',
     *           ]
     *     }
     *
     */
    getRoles(req, res) {
        return res.ok(Flux.config.roles);
    }

    /**
     * @api {post} /auth/logout Inform that a user is disconnected
     * @apiName logout
     * @apiGroup Authentication
     * @apiDescription Will register the user as disconnected
     */
    logout(req, res) {
        SessionService.disconnect(req.session)
        .then(() => {
            res.ok();
        })
        .catch(res.error);
    }

    /**
     * @api {post} /auth/keepalive Inform that a user is still connected
     * @apiName keepalive
     * @apiGroup Authentication
     * @apiDescription 90 sec after the last request, the server will consider
     * that user is disconnected. Use this method to tell to the server that
     * user is still connected.
     */
    keepAlive(req, res) {
        res.ok();
    }
}

module.exports = AuthController;
