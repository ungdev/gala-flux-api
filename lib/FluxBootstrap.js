const fs = require('fs');


/**
 * This class hold static functions used by Flux object to init and start the server.
 */
class FluxBootstrap {


    /**
     * This method will load configuration files, merge them and return the Config Object
     * @return {Promise} to the generated Config object
     */
    static initConfig() {
        const Flux = require('../Flux');
        return new Promise((resolve, reject) => {
            const configPath = Flux.rootdir + '/config/';
            let main = {};
            let env = {};
            let local = {};
            fs.readdir(configPath, (error, filenames) => {
                if(error) return reject(error);
                for (let filename of filenames) {
                    let parts = filename.split('.');

                    // If not .js file, not two dots in filename or a directory
                    // then ignore and warn it.
                    if ((parts.length != 2 && parts.length != 3)
                        || parts[parts.length-1] != 'js'
                        || !fs.lstatSync(configPath + filename).isFile()) {

                        // Throw warning if not a dist file
                        if (parts[parts.length-1] !== 'dist') {
                            Flux.log.warn('File ignored in the config directory: ', filename);
                        }

                        return;
                    }

                    // Add the file to each config object
                    if(parts[1] === 'local') {
                        local[parts[0]] = require(configPath + filename);
                    }
                    else if(parts[1] === Flux.env) {
                        env[parts[0]] = require(configPath + filename);
                    } else {
                        main[parts[0]] = require(configPath + filename);
                    }
                }

                // Merge into config object
                for (let key in env) {
                    main[key] = Object.assign(main[key], env[key]);
                }
                for (let key in local) {
                    main[key] = Object.assign(main[key], local[key]);
                }

                // Resolve promise
                resolve(main);
            });
        });
    }

    /**
     * Connect to DB and return the sequelize object
     * initConfig needs to be finished before
     * @return {Promise} to the sequelize object
     */
    static initDB() {
        const Flux = require('../Flux');
        const Sequelize = require('sequelize');
        let sequelize = new Sequelize(Flux.config.database.database, Flux.config.database.user, Flux.config.database.password, {
            host: Flux.config.database.host,
            dialect: 'mysql',
            logging: Flux.config.database.logging,
        });
        return sequelize.sync()
        .then((a) => {
            return sequelize.authenticate();
        })
        .then(() => {
            return Promise.resolve(sequelize);
        })
    }

    /**
     * This method will load models and return an array to access them
     * initDB needs to be finished before
     * @return {Promise} to the model array
     */
    static initModels() {
        const Flux = require('../Flux');
        return new Promise((resolve, reject) => {
            const modelPath = Flux.rootdir + '/api/models/';
            let models = [];
            fs.readdir(modelPath, (error, filenames) => {
                if(error) return reject(error);
                for (let filename of filenames) {
                    // throw wanring and ignore if it doesn't begin with an uppercase letter
                    if (filename.charAt(0) !== filename.charAt(0).toUpperCase()) {
                        Flux.log.warn('Model files should begin with an uppercase letter. File ignored: ', filename);
                        return;
                    }

                    // add model to list
                    models[filename.split('.')[0]] = require(modelPath + filename);
                    Flux[filename.split('.')[0]] = models[filename.split('.')[0]];
                }

                // Load references between models
                for (let name in models) {
                    if(typeof models[name].buildReferences === 'function') {
                        models[name].buildReferences();
                    }
                }

                // Resolve promise
                resolve(models);
            });
        });
    }


    /**
     * Generate an array of controllers
     * @return {Promise} to an object of instances of controllers
     */
    static initControllers() {
        const Flux = require('../Flux');
        return new Promise((resolve, reject) => {
            const controllersPath = Flux.rootdir + '/api/controllers/';
            fs.readdir(controllersPath, (error, filenames) => {
                if(error) return reject(error);
                let controllers = {};
                for (let filename of filenames) {

                    // ignore base Controller.js and file that doen't finish with Controller.js
                    if (filename == 'Controller.js'
                        || filename.substr(filename.length-13) != 'Controller.js'
                        || !fs.lstatSync(controllersPath + filename).isFile()) {

                        // Throw warning if not a dist file
                        if (filename !== 'Controller.js') {
                            Flux.log.warn('File ignored in the Controller directory: ', filename);
                        }

                        return;
                    }

                    // Instanciate the controller
                    let controller = require(controllersPath + filename);
                    controllers[filename.substr(0, filename.length-3)] = new controller();
                }

                // Resolve promise
                resolve(controllers);
            });

        });
    }

    /**
     * Init Express HTTP server
     * initConfig needs to be finished before
     * initControllers needs to be finished before
     * @return {Promise} to the {express, server} object
     */
    static initServer() {
        const Flux = require('../Flux');
        return new Promise((resolve, reject) => {
            const express = require('express')();
            const bodyParser = require('body-parser');
            const multer = require('multer');
            const cors = require('cors');

            // Configure multer for file upload into /tmp directory
            let storage = multer.diskStorage({});
            let upload = multer({ storage: storage });

            // Configure express
            express.set('trust proxy', Flux.config.server.trustProxy);
            express.set('view engine', 'ejs');

            // Add required middlewares
            express.use(require(Flux.rootdir + '/api/middlewares/extendRes'));
            express.use(bodyParser.json());
            express.use(cors(Flux.config.cors));

            // Init homepage route
            express.get('/', function(req, res) {
                res.render('homepage', {Flux: Flux});
            });

            // Init routes and middlewares
            let routes = Flux.config.routes;
            for (let route in routes) {
                let split = route.split(/\s+/g);

                // Generate method and path
                let method = 'all';
                let path = route;
                if(split.length >= 2) {
                    method = split[0];
                    // Remove trailing spaces
                    path = route.substr(split[0].length + 1).replace(/^\s+|\s+$/gm, '');
                }

                // Init data perser middleware
                express[method](path, require(Flux.rootdir + '/api/middlewares/dataParser'));

                // Init global middlewares
                let middlewares = Flux.config.server.middlewares;
                if(middlewares) {
                    for (let middleware of middlewares) {
                        express[method](path, require(Flux.rootdir + '/api/middlewares/' + middleware));
                    }
                }

                // Load route middlewares
                if(routes[route].middlewares) {
                    for (let middleware of routes[route].middlewares) {
                        express[method](path, require(Flux.rootdir + '/api/middlewares/' + middleware));
                    }
                }


                // Load action from controllers
                let controllers = {};
                if(routes[route].action || routes[route].action.split('.') != 2) {
                    let controller = routes[route].action.split('.')[0];
                    let action = routes[route].action.split('.')[1];

                    // Add file upload middleware via multer
                    if(routes[route].file) {
                        express[method](path, upload.single(routes[route].file));
                    }

                    // Add action
                    if(typeof Flux.controllers[controller][action] === 'function') {
                        express[method](path, (req, res) => {
                            Flux.controllers[controller][action](req, res);
                        });
                    }
                    else {
                        throw new Error('Action from route `' + route + '` cannot be found or is not a function.');
                    }
                }
                else {
                    throw new Error('Route `' + route + '` has a bad action attribute or doe\'nt have any. Please check route configuration.');
                }
            }

            // Init global middlewares when 404
            let middlewares = Flux.config.server.middlewares;
            if(middlewares) {
                for (let middleware of middlewares) {
                    express.all('*', require(Flux.rootdir + '/api/middlewares/' + middleware));
                }
            }

            // Add error handeling middlewares
            express.use(require(Flux.rootdir + '/api/middlewares/notFoundHandler'));
            express.use(require(Flux.rootdir + '/api/middlewares/errorHandler'));

            // Init express
            const server = require('http').Server(express);
            server.listen(Flux.config.server.port, Flux.config.server.address, () => {
                resolve({express, server});
            });
        });
    }


    /**
     * Init websocket
     * initServer needs to be finished before
     * @return {Promise} to the io object
     */
    static initWebsocket() {
        const Flux = require('../Flux');
        return new Promise((resolve, reject) => {
            const FluxWebSocket = require('./FluxWebSocket');

            // Init web socket
            let websocket = new FluxWebSocket(Flux.server);

            resolve(websocket.io);
        });
    }



}

module.exports = FluxBootstrap;
