const express = require('express')();
const server = require('http').Server(express);
const bodyParser = require('body-parser');
const FluxWebSocket = require('./lib/FluxWebSocket');

// Load Flux object
const Flux = require('./Flux');
Flux.initModels();

// Configure express
express.set('trust proxy', Flux.config.server.trustProxy);

// Add required middlewares
express.use(require(Flux.rootdir + '/api/middlewares/extendRes'));
express.use(bodyParser.json());

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
    if(routes[route].action || routes[route].action.split('.') != 2) {
        let controller = routes[route].action.split('.')[0];
        let action = routes[route].action.split('.')[1];
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
server.listen(Flux.config.server.port, Flux.config.server.address, () => {
    Flux.info('Flux HTTP server listening on', Flux.config.server.address, 'port' , Flux.config.server.port);
});

// Init web socket
let websocket = new FluxWebSocket(server);
Flux.io = websocket.io;


/**
 * app.js
 *
 * Use `app.js` to run your app without `sails lift`.
 * To start the server, run: `node app.js`.
 *
 * This is handy in situations where the sails CLI is not relevant or useful.
 *
 * For example:
 *     => `node app.js`
 *     => `forever start app.js`
 *     => `node debug app.js`
 *     => `modulus deploy`
 *     => `heroku scale`
 *
 *
 * The same command-line arguments are supported, e.g.:
 * `node app.js --silent --port=80 --prod`
 */


// Ensure we're in the project directory, so cwd-relative paths work as expected
// no matter where we actually lift from.
// > Note: This is not required in order to lift, but it is a convenient default.
// process.chdir(__dirname);

// Attempt to import `sails`.
// var sails;
// try {
//     sails = require('sails');
// } catch (e) {
//     console.error('To run an app using `node app.js`, you usually need to have a version of `sails` installed in the same directory as your app.');
//     console.error('To do that, run `npm install sails`');
//     console.error('');
//     console.error('Alternatively, if you have sails installed globally (i.e. you did `npm install -g sails`), you can use `sails lift`.');
//     console.error('When you run `sails lift`, your app will still use a local `./node_modules/sails` dependency if it exists,');
//     console.error('but if it doesn\'t, the app will run with the global sails instead!');
//     return;
// }
//
// // --•
// // Try to get `rc` dependency (for loading `.sailsrc` files).
// var rc;
// try {
//     rc = require('rc');
// } catch (e0) {
//     try {
//         rc = require('sails/node_modules/rc');
//     } catch (e1) {
//         console.error('Could not find dependency: `rc`.');
//         console.error('Your `.sailsrc` file(s) will be ignored.');
//         console.error('To resolve this, run:');
//         console.error('npm install rc --save');
//         rc = function () { return {}; };
//     }
// }
//
// // Start server
// sails.lift(rc('sails'), (err) => {
//     if(err) {
//         throw err;
//     }
//
//     // Clean session collection
//     Session.destroy({firebaseToken: null}).exec((error) => {
//         if (error) sails.log.error('Error while cleaning session collection', error);
//     });
//
//     // Debug sessions
//     /*
//     setInterval(() => {
//         Session.find().exec((error, sessions) => {
//             sails.log.debug('-------------------------------------------------------------sessions : ' + sessions.length);
//             for (let session of sessions) {
//                 User.findOneById(session.user).exec((error, user) => {
//                     Team.findOneById(user.team).exec((error, team) => {
//                         if(session.firebaseToken) {
//                             sails.log.debug('debug: ' + user.name + ' (' + team.name + '): Android('+session.socketId+', '+session.firebaseToken.substr(0, 32)+', '+session.deviceId+')')
//                         }
//                         else {
//                             sails.log.debug('debug: ' + user.name + ' (' + team.name + '): Browser('+session.socketId + ')')
//                         }
//                     });
//                 });
//             }
//         });
//     }, 3000);
//     */
//
//     // Init firebase
//     if(sails.config.firebase.database) {
//         var admin = require("firebase-admin");
//
//         // fix private_key format
//         sails.config.firebase.serviceAccount.private_key = sails.config.firebase.serviceAccount.private_key.replace(/\\+n/g, '\n');
//
//         sails.log.info('Init Firebase.')
//         admin.initializeApp({
//             credential: admin.credential.cert(sails.config.firebase.serviceAccount),
//             databaseURL: 'https://' + sails.config.firebase.database + '.firebaseio.com'
//         });
//     }
//     else {
//         sails.log.warn('Empty firebase configuration. Push notifications are disabled.')
//     }
//
// });
