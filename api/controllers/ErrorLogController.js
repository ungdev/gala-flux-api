/**
 * BottleActionController
 *
 * @description :: Server-side logic for managing BottleActions
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

class ErrorLogController {

    /**
     * @api {post} /errorlog/subscribe Subscribe to new items
     * @apiName subscribe
     * @apiGroup ErrorLog
     * @apiDescription Subscribe to all new items.
     */
     subscribe(req, res) {
        if(req.team.can('errorLog/read')) {
            ErrorLog.watch(req);
            ErrorLog.find().exec((error, items) => {
                if(error) return res.negotiate(error);
                ErrorLog.subscribe(req, _.pluck(items, 'id'));
                return res.ok();
            });
        }
    }


    /**
     * @api {post} /errorlog/unsubscribe Unsubscribe from new items
     * @apiName subscribe
     * @apiGroup ErrorLog
     * @apiDescription Unsubscribe from new items
     */
     unsubscribe(req, res) {
        ErrorLog.unwatch(req);
        ErrorLog.find().exec((error, items) => {
            if(error) return res.negotiate(error);
            ErrorLog.unsubscribe(req, _.pluck(items, 'id'));
            return res.ok();
        });
    }


    /**
     * @api {get} /errorlog/find Find all items
     * @apiName find
     * @apiGroup ErrorLog
     * @apiDescription Get the list of all items
     *
     * @apiUse forbiddenError
     */
     find(req, res) {

        // check permissions
        if (!(req.team.can('errorLog/read'))) {
            return res.error(403, 'forbidden', 'You are not authorized read error logs');
        }

        // read filters
        let where = {};
        if (req.allParams().filters) {
            where = req.allParams().filters;
        }

        ErrorLog.find(where)
        .exec((error, user) => {
            if (error) {
                return res.negotiate(error);
            }
            return res.ok(user);
        });

    }


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
        let ip = (req.ip ? req.ip : req.socket.handshake.address);
        ErrorLog.count({ip: ip}).exec((error, count) => {
            if(error) {
                return res.negotiate(error);
            }

            // Anti flood security
            if(count >= 100) {
                return res.ok();
            }

            // Create user
            let errorLog = {
                ip: ip,
            };
            if(req.user) errorLog.user = req.user;
            if(req.param('message')) errorLog.message = req.param('message');
            if(req.param('error')) errorLog.error = req.param('error');
            if(req.param('details')) errorLog.details = req.param('details');
            if(req.param('stack')) errorLog.stack = req.param('stack');
            if(req.param('notificationStack')) errorLog.notificationStack = req.param('notificationStack');

            ErrorLog.create(errorLog).exec((error, errorLog) => {
                if (error) {
                    return res.negotiate(error);
                }

                return res.ok();
            });
        });
    }

};

module.exports = ErrorLogController;
