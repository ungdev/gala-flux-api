const Flux = require('../../Flux');
const { ExpectedError } = require('../../lib/Errors');
const ModelController = require('../../lib/ModelController');

class ErrorLogController extends ModelController {

    constructor() {
        super(Flux.ErrorLog);
    }

    /**
     * @api {post} /errorlog/subscribe Subscribe to new items
     * @apiName subscribe
     * @apiGroup ErrorLog
     * @apiDescription Subscribe to all new items.
     */
    //  subscribe(req, res) {}


    /**
     * @api {post} /errorlog/unsubscribe Unsubscribe from new items
     * @apiName subscribe
     * @apiGroup ErrorLog
     * @apiDescription Unsubscribe from new items
     */
    // unsubscribe(req, res) {}


    /**
     * @api {get} /errorlog/find Find all items
     * @apiName find
     * @apiGroup ErrorLog
     * @apiDescription Get the list of all items
     *
     * @apiUse forbiddenError
     */
    //  find(req, res) {}

    /**
     * @api {post} /errorlog/create Create an user
     * @apiName create
     * @apiGroup ErrorLog
     * @apiDescription Create a log entry
     *
     * @apiUse badRequestError
     * @apiUse forbiddenError
     */
    create(req, res) {
        // User can only create message from himself
        req.data.ip = req.ip;
        req.data.userId = (req.user ? req.user.id : null);

        // Anti flood
        Flux.ErrorLog.count({where: {ip: req.ip}})
        .then(count => {
            if(count >= 100) {
                throw new Error('IP', ip, 'reach 100 errors. Next errors will not be logged into db');
            }

            // Forward to parent
            super.create(req, res);

        })
        // Don't send error to client because we already have an error in the client
        .catch((error) => {
            Flux.log.error('Error while creating a new error log', error);
            res.ok();
        });
    }

}

module.exports = ErrorLogController;
