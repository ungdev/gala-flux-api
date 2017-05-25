const Flux = require('../../Flux');

/**
 * This middleware will parse incoming data from body and query and will merge them into a single req.data object.
 */
module.exports = function (req, res, next) {
    let query = {};
    if(req.query.data) {
        try {
            query = JSON.parse(unescape(req.query.data));
        } catch(e) {
            // Ignore this field if it's not possible to parse it
        }
    }
    let body = req.body || {};
    let params = req.params || {};

    // req.query.data
    req.data = Object.assign(query, body, params);

    return next();
};
