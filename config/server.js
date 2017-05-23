module.exports = {


    /**
     * Express and socket io listen port
     */
    port: process.env.PORT || 3000,

    /**
     * Express and socket io listen address
     * :: to listen to everything in ipv6 and ipv4
     */
    address: '::',

    /**
     * Thoses middlewares will be added to all requests no matter the route configuration
     */
    middlewares: [],

    /**
     * If true, this will trust the reverse proxy and accept given IP as remote IP
     */
    trustProxy: true,
};
