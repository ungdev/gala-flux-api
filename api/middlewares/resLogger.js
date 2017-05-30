const Flux = require('../../Flux');

/**
 * This middleware will log as debug every request received (http or socket)
 */
module.exports = function(req, res, next) {
    res.on('finish', function() {

        // Simple
        Flux.log.debug('### Res:', req.method, req.originalUrl, ':', res.statusCode)

        // Full
        // Flux.log.debug('--------------- New response ---------------');
        // Flux.log.debug('method', req.method);
        // Flux.log.debug('url', req.originalUrl);
        // Flux.log.debug('statusCode', res.statusCode);
        // Flux.log.debug('statusMessage', res.statusMessage);
        // Flux.log.debug('headers', res.getHeaders());
        // Flux.log.debug('user', req.user && req.user.id + ' : ' + req.user.name);
        // Flux.log.debug('team', req.team && req.team.id + ' : ' + req.team.name);
        // if(res.storedJson) Flux.log.debug('json body', res.storedJson);
        // Flux.log.debug('--------------------------------------------');
    });

    return next();
};
