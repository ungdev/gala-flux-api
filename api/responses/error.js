/**
 * Generic Error Response
 *
 * Usage:
 * return res.error(req, 404, 'UserNotFound', 'There is no User with this ID');
 *
 */

module.exports = function error (req, code, status, message, data) {
    if(typeof data === 'undefined') {
        data = {};
    }
    if(typeof data !== 'object') {
        throw new TypeError('`data` should be an object, `' + (typeof data) + '` given');
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
            controller: req.options ? req.options.controller : null,
            action: req.options ? req.options.action : null,
        }
    };

    return this.res.json(code, data);
};
