const fs = require('fs');
const Sequelize = require('sequelize');


/**
 * Instance of the Flux class used to create a singleton
 */
let instance = null;

/**
 * This class describe the singleton object used anywhere in the application to
 * access global features like configuration.
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
        }

        return instance;
    }

    /**
     * This method will load models and add public access to them into this object.
     * This cannot be executed in constructor because database is not initialized.
     */
    initModels() {
        const modelPath = this.rootdir + '/api/models/';
        let models = [];
        fs.readdirSync(modelPath).forEach(filename => {
            // throw wanring and ignore if it doesn't begin with an uppercase letter
            if (filename.charAt(0) !== filename.charAt(0).toUpperCase()) {
                this.warn('Model files should begin with an uppercase letter. File ignored: ', filename);
                return;
            }

            // add model to list
            instance[filename.split('.')[0]] = require(modelPath + filename);
            models.push(instance[filename.split('.')[0]]);
        });

        // Load references between models
        for (let model of models) {
            if(typeof model.buildReferences === 'function') {
                model.buildReferences();
            }
        }

        // Add models to Flux object
        Object.assign(instance, models);
    }

    /**
     * Read-only configuration
     * Configuration is readed once on the first call, but you can call
     * conigReload() to reload configuration.
     * @return {Object} Content of the configuration
     */
    get config() {
        // Load configuration if necessary
        if (!this._configuration) {
            const configPath = this.rootdir + '/config/';
            let main = {};
            let env = {};
            let local = {};
            fs.readdirSync(configPath).forEach(filename => {
                let parts = filename.split('.');

                // If not .js file, not two dots in filename or a directory
                // then ignore and warn it.
                if ((parts.length != 2 && parts.length != 3)
                    || parts[parts.length-1] != 'js'
                    || !fs.lstatSync(configPath + filename).isFile()) {

                    // Throw warning if not a dist file
                    if (parts[parts.length-1] !== 'dist') {
                        this.warn('File ignored in the config directory: ', filename);
                    }

                    return;
                }

                // Add the file to each config object
                if(parts[1] === 'local') {
                    local[parts[0]] = require(configPath + filename);
                }
                else if(parts[1] === this.env) {
                    env[parts[0]] = require(configPath + filename);
                } else {
                    main[parts[0]] = require(configPath + filename);
                }
            });

            // Merge config object
            this._configuration = main;
            for (let key in env) {
                this._configuration[key] = Object.assign(this._configuration[key], env[key]);
            }
            for (let key in local) {
                this._configuration[key] = Object.assign(this._configuration[key], local[key]);
            }
        }

        // Return parsed configuration
        return Object.assign({}, this._configuration);
    }

    /**
     * Will force to reload configuration
     */
    configReload() {
        this._configuration = null;
    }

    /**
     * Get list of instance of controllers
     * @return {Array} Instances of controllers
     */
    get controllers() {
        // Load configuration if necessary
        if (!this._controllers) {
            this._controllers = {};
            const controllersPath = this.rootdir + '/api/controllers/';
            fs.readdirSync(controllersPath).forEach(filename => {

                // ignore base Controller.js and file that doen't finish with Controller.js
                if (filename == 'Controller.js'
                    || filename.substr(filename.length-13) != 'Controller.js'
                    || !fs.lstatSync(controllersPath + filename).isFile()) {

                    // Throw warning if not a dist file
                    if (filename !== 'Controller.js') {
                        this.warn('File ignored in the Controller directory: ', filename);
                    }

                    return;
                }

                // Instanciate the controller
                let controller = require(controllersPath + filename);
                this._controllers[filename.substr(0, filename.length-3)] = new controller();
            });
        }

        // Return parsed configuration
        return Object.assign({}, this._controllers);
    }

    get sequelize() {
        // Connect to db if necessary
        if (!this._sequelize) {
            // TODO use configuration
            this._sequelize = new Sequelize('flux', 'root', '', {
                host: 'localhost',
                dialect: 'mysql',
            });
            this._sequelize.sync();
        }

        // Return sequelize object
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
     * Will write in the console in red, then append to the dev and prod log file
     */
    error(...params) {
        // TODO write to logfile
        console.error('\x1b[31m', ...params, '\x1b[0m');
    }

    /**
     * Will write in the console in orange, then append to the dev and prod log file
     */
    warn(...params) {
        // TODO write to logfile
        console.warn('\x1b[33m', ...params, '\x1b[0m');
    }

    /**
     * Will write in the console in blue, then append to the dev log file
     */
    info(...params) {
        // TODO write to logfile
        console.info('\x1b[34m', ...params, '\x1b[0m');
    }

    /**
     * Will write in the console in green, then append to the dev log file
     */
    debug(...params) {
        // TODO write to logfile
        console.log('\x1b[32m', ...params, '\x1b[0m');
    }

    /**
     * Get env if defined in env var, if not set development mode
     */
    get env() {
        return (process.env.NODE_ENV ? process.env.NODE_ENV : 'development');
    }
}

module.exports = new Flux();
