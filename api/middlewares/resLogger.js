const Flux = require('../../Flux');

/**
 * This middleware will log as debug every request received (http or socket)
 */
module.exports = function(req, res, next) {
    res.on('finish', function() {

        // Simple
        Flux.debug('### Res:', req.method, req.originalUrl, ':', res.statusCode)

        // Full
        // Flux.debug('--------------- New response ---------------');
        // Flux.debug('method', req.method);
        // Flux.debug('url', req.originalUrl);
        // Flux.debug('statusCode', res.statusCode);
        // Flux.debug('statusMessage', res.statusMessage);
        // Flux.debug('headers', res.getHeaders());
        // Flux.debug('user', req.user && req.user.id + ' : ' + req.user.name);
        // Flux.debug('team', req.team && req.team.id + ' : ' + req.team.name);
        // if(res.storedJson) Flux.debug('json body', res.storedJson);
        // Flux.debug('--------------------------------------------');
    });

    return next();
};
