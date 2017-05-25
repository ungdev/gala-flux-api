const Flux = require('../../Flux');

/**
 * Handle error thrown automatically by express
 * This middleware should be add after all routes and middleware
 */
module.exports = function(err, req, res, next) {
    res.error500(err);
};
