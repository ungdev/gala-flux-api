const Flux = require('../../Flux');

/**
 * Handle not found error
 * This middleware should be add after all routes and middleware (except errorHandler)
 */
module.exports = function(req, res, next) {
    return res.error(404, 'NotFound', 'The requested endpoint cannot be found');
};
