const JWTService = require('../services/JWTService');
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
        if(typeof data === 'undefined') {
            data = {};
        }
        if(typeof data !== 'object') {
            Flux.error('res.ok(data) : `data` should be an object, `' + (typeof data) + '` given');
            data = {};
        }

        return this.status(200).json(data);
    };

    /**
     * Generic Error Response
     *
     * Usage:
     * return res.error(404, 'UserNotFound', 'There is no User with this ID');
     *
     */
    res.error = function(code, status, message, data) {
        if(typeof data === 'undefined') {
            data = {};
        }
        if(typeof data !== 'object') {
            Flux.error('res.error(data) : `data` should be an object, `' + (typeof data) + '` given');
            data = {};
        }

        data._error = {
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
        };

        return this.status(code).json(data);
    };

    return next();
};
