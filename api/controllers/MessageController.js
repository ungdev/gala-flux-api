const Flux = require('../../Flux');
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

class MessageController extends ModelController {

    constructor() {
        super(Flux.Message);
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
     * @api {get} /message/find Get all messages
     * @apiName find
     * @apiGroup Message
     * @apiDescription Get the list of all messages according to permissions.
     * @apiSuccess {Array} Array An array of message
     * @apiSuccess {Message} Array.mesage A message object
     * @apiSuccess {String} Array.mesage.text Message content
     * @apiSuccess {id} Array.mesage.sender Sender User id
     * @apiSuccess {Team} Array.mesage.channel Target channel name without the #
     * * `public:[teamname]` : For subject concerning the team. [teamname] will be converted alphanumeric only
     * * `private:[teamname]` : For internal private messages inside the team
     * * `group:[groupname]` : For group discutions according to the `group` field in team
     */
    // find(req, res) {}


    /**
     * @api {post} /message/create Send a message
     * @apiName create
     * @apiGroup Message
     * @apiDescription Send a message
     *
     * @apiParam {string} text The message content (required)
     * @apiParam {string} channel  Target channel name without the # (Optional)
     *
     * @apiSuccess {Message} message The message that you've juste created
     *
     * @apiUse badRequestError
     * @apiUse forbiddenError
     */
    create(req, res) {
        // User can only create message from himself
        req.data.userId = req.user.id;

        return super.create(req, res);
    }


    /**
     * @api {get} /message/channels Get channels
     * @apiName getChannels
     * @apiGroup Message
     * @apiDescription Get the list of channels according to read permissions
     * @apiSuccess {Array} list An array of channel name (without #)
     */
     getChannels(req, res) {
        let list = new Set();

        // Receive #group:[groupname] and #[teamname] but can send only in #[teamname]
        if(req.team.can('message/oneChannel')) {
            list.add('public:'+Flux.Message.toChannel(req.team.name));
            list.add('group:'+Flux.Message.toChannel(req.team.group));
            return res.ok([...list]);
        }
        else if(req.team.can('message/admin') || req.team.can('message/public')) {
            list.add('public:General');
            Flux.Team.findAll()
            .then(teams => {
                // Public
                for (let team of teams) {
                    list.add('public:'+Flux.Message.toChannel(team.name));
                }

                // Group
                if(req.team.can('message/group') || req.team.can('message/admin')) {
                    for (let team of teams) {
                        list.add('group:'+Flux.Message.toChannel(team.group));
                    }
                }
                else {
                    list.add('group:'+Flux.Message.toChannel(req.team.group));
                }

                // Private
                if(req.team.can('message/private')) {
                    list.add('private:'+Flux.Message.toChannel(req.team.name));
                }
                else if(req.team.can('message/admin')){
                    for (let team of teams) {
                        if(team.can('message/private') || team.can('message/admin')) {
                            list.add('private:'+Flux.Message.toChannel(team.name));
                        }
                    }
                }

                let out = [...list];
                out.sort();
                return res.ok(out);
            })
            .catch(res.error);
        }
        else {
            return res.error(403, 'forbidden', 'You are not authorized to read any channel');
        }
    }
}

module.exports = MessageController;
