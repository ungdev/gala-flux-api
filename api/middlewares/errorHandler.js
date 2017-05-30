const Flux = require('../../Flux');

/**
 * Handle error thrown automatically by express
 * This middleware should be add after all routes and middleware
 */
module.exports = function(err, req, res, next) {
    if(res.error) {
        res.error(err);
    }
    else {
        Flux.log.error(err);
        res.status(500).json({});
    }
};
