const Flux = require('../../Flux');

/**
 * This middleware will log as debug every request received (http or socket)
 */
module.exports = function(req, res, next) {
    // Simple
    Flux.log.debug('### Req:', req.method, req.originalUrl)

    // Full mode
    // Flux.log.debug('--------------- New request ---------------');
    // Flux.log.debug('hostname', req.hostname);
    // Flux.log.debug('protocol', req.protocol);
    // Flux.log.debug('method', req.method);
    // Flux.log.debug('path', req.path);
    // Flux.log.debug('url', req.originalUrl);
    // Flux.log.debug('headers', req.headers);
    // Flux.log.debug('body', req.body);
    // Flux.log.debug('ip', req.ip);
    // Flux.log.debug('ips', req.ips);
    // Flux.log.debug('params', req.params);
    // Flux.log.debug('query', req.query);
    // Flux.log.debug('route.path', req.route && req.route.path);
    // Flux.log.debug('socket.id', req.socket && req.socket.id);
    // Flux.log.debug('-------------------------------------------');
    return next();
};
