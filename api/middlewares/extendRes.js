const Flux = require('../../Flux');
const Sequelize = require('sequelize');
const {NotFoundError, ForbiddenError, BadRequestError} = require('../../lib/Errors');

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
     * or
     * return res.error(new Error('Fatal error'));
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
        };


        if(code instanceof NotFoundError) {
            data._error.code = 404;
            data._error.status = 'NotFoundError';
            data._error.message = code.message || 'Not Found';
            return res.status(404).json(data);
        }
        else if(code instanceof ForbiddenError) {
            data._error.code = 403;
            data._error.status = 'ForbiddenError';
            data._error.message = code.message || 'Forbidden';
            return res.status(403).json(data);
        }
        else if(code instanceof BadRequestError) {
            data._error.code = 400;
            data._error.status = 'BadRequestError';
            data._error.message = code.message || 'Bad Request';
            return res.status(400).json(data);
        }
        else if(code instanceof Sequelize.ValidationError && code.errors) {
            data._error.code = 400;
            data._error.status = 'ValidationError';
            data._error.message = 'Validation error';
            data._error.validation = code.errors;
            return res.status(400).json(data);
        }
        // Unexpected error
        else if(code instanceof Error || !Number.isInteger(code)) {
            Flux.error('Error 500:');
            Flux.error(code);

            return res.error(500, 'UnexpectedError', 'Unexpected server error');
        }
        // Custom error
        else {
            return res.status(code).json(data);
        }
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
