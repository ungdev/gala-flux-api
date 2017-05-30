const http = require('http');
const Flux = require('../Flux');

class FluxWebSocket {


    /**
     * Connect the socket to the http server
     * @param {object} server  Node.js HTTP server
     */
    constructor(server) {
        this._server = server;
        this._io = require('socket.io')(server);
        this._io.on('connection', this._handleNewSocket.bind(this));
    }

    /**
     * Getter for socket.io object
     * @return Socket.io object
     */
    get io() {
        return this._io;
    }

    /**
     * Called when a client connect to the websocket server
     * @param {Socket} socket The new socket object
     */
    _handleNewSocket(socket) {
        Flux.log.info('New websocket client !');

        // Add socket endpoint to convert request to HTTP
        socket.on('request', (data) => this.injectHttpRequest(socket, data));
    }


    /**
     * This method will inject an HTTP request into express server
     * @param {Socket} socket Web socket object
     * @param {Object} data Data object with at least url and method,
     * but can also contain headers, data and requestId.
     */
    injectHttpRequest(socket, data) {
        if(!data.method || !data.url) {
            Flux.log.warn('Socket.io request ignored because method or url is not defined');
            return;
        }

        // Forge req and res object
        let req = new http.IncomingMessage();
        req.method = data.method;
        req.url = data.url;
        req.headers = data.headers || {};
        req.httpVersion = '1.1';
        req.socket = socket;
        req.body = data.data || 'null';
        req.connection = socket.request.connection;
        req.socket.destroy = () => {};

        let res = new http.ServerResponse(req);
        res.shouldKeepAlive = false;
        process.stdout._httpMessage = null;

        // Create a fake socket stream, without it res.onFinish is never called
        let fakeSocket = new require('stream').Writable();
        fakeSocket._write = () => {};
        res.assignSocket(fakeSocket);

        // Send response to client when finished
        if(data.requestId) {
            // Prevent memory leak if finished is never called
            let timeout = setTimeout(function () {
                Flux.log.error('Timeout: No request response after 60 secs for `', data.method, data.url, '`');
                res.error(500, 'SocketTimeout', 'Server internal timeout: No response to this request have been created in 60 secs.');
                res.emit('finish')
            }, 60000);

            // Sent response on finish
            res.once('finish', () => {
                socket.emit('response-' + data.requestId, {
                    headers: res.getHeaders(),
                    statusCode: res.statusCode,
                    statusMessage: res.statusMessage,
                    data: res.storedJson,
                });

                // Cancel timeout
                clearTimeout(timeout);
            });
        }

        // Emit request to express server
        this._server.emit('request', req, res);
    }

}


module.exports = FluxWebSocket;
