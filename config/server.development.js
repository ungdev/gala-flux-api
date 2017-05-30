module.exports = {
    /**
     * During development, we don't want the server to be accessed outside of the computer
     * Use `::` if you want to access the server from local network
     */
    address: 'localhost',

    /**
     * Log every request and response during development
     */
    middlewares: ['reqLogger', 'resLogger'],
};
