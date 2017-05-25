const Flux = require('../../Flux');

/**
 * This middleware will log as debug every request received (http or socket)
 */
module.exports = function(req, res, next) {
    // Simple
    Flux.debug('### Req:', req.method, req.originalUrl)

    // Full mode
    // Flux.debug('--------------- New request ---------------');
    // Flux.debug('hostname', req.hostname);
    // Flux.debug('protocol', req.protocol);
    // Flux.debug('method', req.method);
    // Flux.debug('path', req.path);
    // Flux.debug('url', req.originalUrl);
    // Flux.debug('headers', req.headers);
    // Flux.debug('body', req.body);
    // Flux.debug('ip', req.ip);
    // Flux.debug('ips', req.ips);
    // Flux.debug('params', req.params);
    // Flux.debug('query', req.query);
    // Flux.debug('route.path', req.route && req.route.path);
    // Flux.debug('socket.id', req.socket && req.socket.id);
    // Flux.debug('-------------------------------------------');
    return next();
};
