const fs = require('fs');
const Sequelize = require('sequelize');
const winston = require('winston');
const FluxBootstrap = require('./lib/FluxBootstrap');



/**
 * Instance of the Flux class used to create a singleton
 */
let instance = null;

/**
 * This class describe the singleton object used anywhere in the application to
 * access global features like configuration.
 *
 * This object contain also all code that initiate the server. Use start() if you need it.
  *
  * This class is a singleton, and generate the Flux object from which you can
  * access a lot of things. See documentation on github for more informations
 *
 * Please be careful when you edit this file, because one modification
 * (of the code or the values on runtime) can lead ton unexpected behaviour
 * anywhere in the applicaiton
 */
class Flux {

    /**
     * Singleton constructor
     */
    constructor() {
        if (!instance) {
            instance = this;

            // Start the logger before anything, because we need to log everything
            winston.exitOnError = false;
            winston.cli().colorize = true;
            winston.add(winston.transports.File, {
                filename: this.rootdir + '/logs/' + this.env + '.log',
                level: (this.env == 'development' ? 'silly' : 'warn'),
                json: false,
            });
            this.log = winston;

        }

        return instance;
    }


    /**
     * Start the full server
     * @return {Promise} to the end of the initialization
     */
    start() {
        this.log.info('=== Welcome to Flux Server ===');
        this.log.info('Config..');
        return FluxBootstrap.initConfig()
        .then((config) => {
            this._config = config;
            this.log.info(' -> OK');

            this.log.info('Connect to database..');
            return FluxBootstrap.initDB();
        })
        .then((sequelize) => {
            this._sequelize = sequelize;
            this.log.info(' -> OK');

            this.log.info('Models.. ');
            return FluxBootstrap.initModels();
        })
        .then((models) => {
            Object.assign(this, models);
            this.log.info(' -> OK: ' + Object.keys(models).length + ' models loaded');

            this.log.info('Controllers.. ');
            return FluxBootstrap.initControllers();
            })
            .then((controllers) => {
            this._controllers = controllers;
            this.log.info(' -> OK: ' + Object.keys(controllers).length + ' controllers loaded');

            this.log.info('HTTP Server.. ');
            return FluxBootstrap.initServer();
        })
        .then(({express, server}) => {
            this.server = server;
            this.express = express;
            this.log.info(' -> OK: HTTP server listening on ' + this.config.server.address + ' port ' + this.config.server.port);

            this.log.info('Websocket Server.. ');
            return FluxBootstrap.initWebsocket();
        })
        .then(() => {
            this.log.info(' -> OK');
            this.log.info('');
            this.log.info('Flux server started!');
            this.log.info('===========================\n\n');
            return Promise.resolve();
        })
        .catch((error) => {
            this.log.error('Error during Flux bootstrap', error);
        })
    }

    /**
     * Stop the server
     * @return {Promise} to the end of the stop
     */
    stop() {
        this.log.info('Bye !')
        if(this.server) this.server.close();
        if(this.sequelize) this.sequelize.close();
    }

// error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5
    /**
     * Start the necessary component of the server to execute CLI code
     * @return {Promise} to the end of the initialization
     */
    startCLI() {
        this.log.info('=== Welcome to Flux CLI ===');
        this.log.info('Config..');
        return FluxBootstrap.initConfig()
        .then((config) => {
            this._config = config;
            this.log.info(' -> OK');

            this.log.info('Connect to database..');
            return FluxBootstrap.initDB();
        })
        .then((sequelize) => {
            this._sequelize = sequelize;
            this.log.info(' -> OK');

            this.log.info('Models.. ');
            return FluxBootstrap.initModels();
        })
        .then((models) => {
            Object.assign(this, models);
            this.log.info(' -> OK: ' + Object.keys(models).length + ' models loaded');

            this.log.info('');
            this.log.info('Flux CLI started!');
            this.log.info('===========================\n\n');
            return Promise.resolve();
        })
        .catch((error) => {
            this.log.error('Error during Flux bootstrap', error);
        });
    }


    /**
     * Read-only configuration
     * Configuration is readed once on the first call, but you can call
     * conigReload() to reload configuration.
     * @return {Object} Content of the configuration
     */
    get config() {
        return this._config;
    }

    /**
     * Get list of instance of controllers
     * @return {Array} Instances of controllers
     */
    get controllers() {
        return this._controllers;
    }

    get sequelize() {
        return this._sequelize;
    }

    /**
     * Get the absolute path to the root directory of the project. Without `/` at the end.
     * @return {String} Absolute path to the projet root directory
     */
    get rootdir() {
        return __dirname;
    }

    /**
     * Get env if defined in env var, if not set development mode
     */
    get env() {
        return (process.env.NODE_ENV ? process.env.NODE_ENV : 'development');
    }

    /**
     * Set socket io instance
     */
    set io(io) {
        this._io = io;
    }

    /**
     * Get socket io instance
     */
    get io() {
        return this._io;
    }
}

module.exports = new Flux();
