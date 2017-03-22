/**
 * AuthController
 *
 * @description Authenticaiton logic and JWT generation
 *
 *
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
 */

const Jwt = require('jsonwebtoken');

module.exports = {

    /**
     * @api {post} /login/ip Authenticate user by IP
     * @apiName ipLogin
     * @apiGroup User
     * @apiDescription Will try to authenticate with the IP used by the client
     * that send the request.
     *
     * @apiSuccess {String} jwt JWT (JSON Web Token) that you have to use
     * to authenticate against other API endpoints.
     *
     * @apiSuccessExample Success
     *     HTTP/1.1 200 OK
     *     {
     *       "jwt": "QnJhdm8sIHR1IGFzIGTDqWNvZMOpIGNlIGNv.ZGUgZW4gQmFzZTY0LCBqJ8Opc3DDqHJlIHF1ZSB0dSBlcyBmaWVyIGRlIHRvaSwgw6dhIG.4nYXJyaXZlIHBhcyB0b3VzIGxlcyBqb3VycyB0dSBzY"
     *     }

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
     * @apiError UserNotInTeam The User is not associated with a Team
     * @apiErrorExample UserNotInTeam
     *     HTTP/1.1 403 Forbidden
     *     {
     *         "_error": {
     *             code: 403,
     *             status: 'UserNotInTeam',
     *             message: 'The User is not associated with a Team'
     *         }
     *     }
     *
     */
    ipLogin: function (req, res) {

        User.attemptIpAuth({
            ip: req.ip,
        }, function (err, user) {
            if (err) {
                return res.negotiate(err);
            }
            if (!user) {
                return res.error(401, 'IPNotFound', 'There is no User associated with this IP');
            }
            if (!user.team) {
                return res.error(403, 'UserNotInTeam', 'The User is not associated with a Team');
            }
            let jwt = Jwt.sign(
                { user: 'user.id' },
                sails.config.jwt.secret,
                { expiresIn: sails.config.jwt.expiresIn });
            return res.ok({jwt});
        });
    },


    /**
     * @api {get} /login/oauth Initiate OAuth log in
     * @apiName oauthLogin
     * @apiGroup User
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
     * @api {post} /login/oauth/submit Submit OAuth
     * @apiName oauthLoginSubmit
     * @apiGroup User
     *
     * @apiDescription Submit the authorization_code of OAuth 2.0 for authentication with EtuUTT.
     * This method will check if the user is known and associated with a team.
     * If it is, a JWT will be returned.
     *
     * @apiParam {string} authorizationCode Authorization_code that you get after user redirection.
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
     * @apiError UserNotInTeam The User is not associated with a Team
     * @apiErrorExample UserNotInTeam
     *     HTTP/1.1 403 Forbidden
     *     {
     *         "_error": {
     *             code: 403,
     *             status: 'UserNotInTeam',
     *             message: 'The User is not associated with a Team'
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
        let token;

        EtuUTT.oauthTokenByAuthCode(req.param('authorizationCode'))
        .then((data) => {
            token = data;
            return EtuUTT.publicUserAccount();
        })
        .then((data) => {
            User.attemptLoginAuth(data.data.login, function (err, user) {
                if (err) {
                    return res.negotiate(err);
                }
                if (!user) {
                    return res.error(401, 'LoginNotFound', 'There is no User associated with this login');
                }
                if (!user.team) {
                    return res.error(403, 'UserNotInTeam', 'The User is not associated with a Team');
                }

                // TODO update user with tokens and other datas

                let jwt = Jwt.sign(
                    { user: 'user.id' },
                    sails.config.jwt.secret,
                    { expiresIn: sails.config.jwt.expiresIn });

                return res.ok({jwt});
            });
        })
        .catch((error) => {
            return res.error(500, 'EtuUTTError', 'An error occurs during communications with the api of EtuUTT');
        })
    },
};
