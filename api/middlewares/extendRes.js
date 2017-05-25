const Flux = require('../../Flux');

/**
 * This middleware will extend the res object with some helpers to format response.
 * This middleware should be called before any middleware. Error handling middleware depends on it.
 */
module.exports = function (req, res, next) {

    /**
     * 200 (OK) Response
     * @param  {Object} data faculative data object
     */
    res.ok = function(data) {
        if(!data) {
            data = {};
        }
        if(typeof data !== 'object' && !Array.isArray(data)) {
            Flux.error('res.ok(data) : `data` should be an object or an array, `' + (typeof data) + '` given');
            data = {};
        }

        return res.status(200).json(data);
    };

    /**
     * Generic Error Response
     *
     * Usage:
     * return res.error(404, 'UserNotFound', 'There is no User with this ID');
     *
     */
    res.error = function(code, status, message) {
        let data = {
            _error: {
                code: code,
                status: status,
                message: message,
                req: {
                    method: req.method,
                    uri: req.url,
                    headers: req.headers,
                    params: req.params,
                    query: req.query,
                    body: req.body,
                    user: req.user ? req.user.id : null,
                    team: req.team ? req.team.id : null,
                }
            }
        }

        return res.status(code).json(data);
    };


    /**
     * Unexpected error. Will throw an error 500
     *
     * Usage:
     * return res.error500(new Error('Fatal error'));
     *
     */
    res.error500 = function(error) {
        Flux.error('Error 500');
        Flux.error(error);
        return res.error(500, 'UnexpectedError', 'Unexpected server error');
    };


    /**
     * Work like default express json() method excecpt that it will store also
     * store object in the res object to let websocket access the answer.
     */
    res._json = res.json;
    res.json = function(data) {
        res.storedJson = data;
        return res._json(data);
    };

    return next();
};
