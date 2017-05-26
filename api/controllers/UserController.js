const Url = require('url');
const fs = require('fs');
const gm = require('gm');
const Flux = require('../../Flux');
const EtuUTTService = require('../services/EtuUTTService');
const { ExpectedError, BadRequestError, ForbiddenError, NotFoundError } = require('../../lib/Errors');
const ModelController = require('../../lib/ModelController');


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


class UserController extends ModelController {

    constructor() {
        super(Flux.User);
    }

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
    etuuttFind(req, res) {
       if (!Flux.config.etuutt.id
           || !Flux.config.etuutt.secret
           || !Flux.config.etuutt.baseUri) {
           throw new ExpectedError(501, 'EtuUTTNotConfigured', 'The server is not configured for the API of EtuUTT');
       }

        if(!req.user.accessToken || !req.user.refreshToken || !req.user.login) {
            throw new ExpectedError(501, 'NotEtuuttUser', 'Authenticated user is not logged in via EtuUTT');
        }

        if(!req.data.query) {
            throw new BadRequestError('`query` parameter is missing.');
        }

        let EtuUTT = EtuUTTService(req.user);
        let out = [];
        EtuUTT.publicUsers({multifield: req.data.query})
        .then((data) => {
            if(!data.data || !Array.isArray(data.data)) {
                throw new ExpectedError(500, 'EtuUTTError', 'Unexpected EtuUTT answer format');
            }

            // Filter user informations
            for (let user of data.data) {
                // find user official image link
                let etuuttLink = Url.parse(Flux.config.etuutt.baseUri);
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
                    avatar: imageLink,
                });
            }
            res.ok(out);

        })
        .catch(res.error);
    }

    /**
     * @api {post} /user/avatar/:id Upload avater of given user
     * @apiName uploadAvatar
     * @apiGroup User
     *
     * @apiDescription Upload avatar of the given user
     *
     * @apiParam {string} id User id
     * @apiParam {file} avtar Avatar image, in jpg max 200x200px
     *
     * @apiUse badRequestError
     * @apiUse forbiddenError
     */
    uploadAvatar(req, res) {
        // Check permissions
        if(!req.team.can('user/admin') && !(req.team.can('user/team'))) {
            throw new ForbiddenError('You are not authorized to create another user in this team');
        }

        if(!req.file || req.file.fieldname != 'avatar') {
            throw new BadRequestError('`avatar` field is missing or there is more than one file sent.');
        }

        // Find target user
        let user;
        Flux.User.findOne({where: {id: req.data.id}})
        .then(data => {
            user = data;
            if(!user) {
                throw new NotFoundError('The requested user cannot be found');
            }

            // Check permissions 2
            if(req.team.can('user/team') && user.team != req.team.id) {
                throw new ForbiddenError('You are not authorized to create another user in this team');
            }

            // Resize and move avatar file
            return new Promise((resolve, reject) => {
                gm(req.file.path)
                .resize(200, 200)
                .noProfile()
                .setFormat('jpg')
                .compress('JPEG')
                .write(Flux.rootdir + '/assets/uploads/user/avatar/' + user.id, (error) => {
                    if(error) {
                        // Delete file on error
                        fs.unlink(req.file.path);
                        throw new Error(error);
                    }
                    resolve();
                });
            });
        })
        .then(() => {
            // On success update user `updatedAt` field
            return user.save();
        })
        .then(() => {
            res.ok();
        })
        .catch(res.error);
    }

    /**
     * @api {get} /user/avatar/:id Get avater of given user
     * @apiName getAvatar
     * @apiGroup User
     *
     * @apiDescription Get avatar of the given user. No authentication required.
     * If the user or the avatar is not found, a default avatar will be shown
     */
    getAvatar(req, res) {
        // Find target user
        Flux.User.findById(req.data.id)
        .then(user => {
            return new Promise((resolve, reject) => {
                if(!user) return reject();
                fs.access(Flux.rootdir + '/assets/uploads/user/avatar/' + req.data.id, fs.constants.R_OK, (accessError) => {
                    if(accessError) return reject(accessError);

                    res.setHeader("Content-Disposition", "inline; filename=avatar.jpg");
                    res.setHeader("Content-Type", "image/jpeg");
                    fs.createReadStream(Flux.rootdir + '/assets/uploads/user/avatar/' + user.id)
                    .on('error', (error) => {
                        return reject(error);
                    })
                    .pipe(res);
                });
            });
        })
        .catch(error => {
            // Ignore error because it can be normal to have no file
            // Just replace the image with default avatar

            res.setHeader("Content-Disposition", "inline; filename=avatar.png");
            res.setHeader("Content-Type", "image/png");
            fs.createReadStream(Flux.rootdir + '/assets/images/default-avatar.png')
            .on('error', (error) => {
                Flux.error('Error while streaming fallback avatar:', error);
                res.end();
            })
            .pipe(res);
        });
    }



    /**
     * @api {post} /user/subscribe Subscribe to new items
     * @apiName subscribe
     * @apiGroup User
     * @apiDescription Subscribe to all new items.
     */
    // subscribe(req, res) {}


    /**
     * @api {post} /user/unsubscribe Unsubscribe from new items
     * @apiName subscribe
     * @apiGroup User
     * @apiDescription Unsubscribe from new items
     */
    // unsubscribe(req, res) {}

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
    // find(req, res) {}

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
    // create(req, res) {}

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
     * @apiSuccess {User} user The user that you've just updated
     *
     * @apiUse badRequestError
     * @apiUse forbiddenError
     * @apiUse notFoundError
     */
    // update(req, res) {}

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
    // destroy(req, res) {}


}

module.exports = UserController;
