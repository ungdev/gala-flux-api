const Flux = require('../../Flux');

/**
 * Handle error thrown automatically by express
 * This middleware should be add after all routes and middleware
 */
module.exports = function(err, req, res, next) {
    Flux.error(err);
    return res.error(500, 'UnexpectedError', 'Unexpected server error');
};
