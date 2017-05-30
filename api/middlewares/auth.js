const SessionService = require('../services/SessionService');
const Sequelize = require('sequelize');
const Flux = require('../../Flux');

/**
 * Try to authenticate user via socket or Authenticaion jwt.
 * If authentication is possible, then req.user and req.team will becreated
 * If authentication is not possible, nothing will change, and the query will happened
 *
 * If you need the user to be authenticated, you can use the requireAuth middleware
 *
 * TODO update last activity in session even for http
 */
module.exports = function (req, res, next) {
    // Find session entry
    new Promise((resolve, reject) => {

        // If socket session
        if (req.socket && req.socket.id) {
            // Try to find a session by session id
            Flux.Session.findOne({
                where: { socketId: req.socket.id },
                include: [{
                    model: Flux.User,
                    include: Flux.Team,
                }]
            })
            .then(resolve)
            .then(reject);
        }
        // If Http Bearer
        else if (req.headers && req.headers.authorization){
            // Try read jwt
            let parts = req.headers.authorization.split(/\s+/g);
            if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
                return reject();
            }
            let jwt = parts[1];

            // Try to decode jwt
            return SessionService.check(jwt)
            .then((decoded) => {
                if(decoded && decoded.sessionId) {

                    // Try to find a session by sessionId found in jwt
                    return Flux.Session.findOne({
                        where: { id: decoded.sessionId },
                        include: [{
                            model: Flux.User,
                            include: Flux.Team,
                        }]
                    })
                    .then(resolve)
                    .then(reject);
                }
                else {
                    return reject();
                }
            })
        }
    })
    .then(session => {
        if(session && session.user && session.user.team) {
            // Save user data to req
            req.session = session;
            req.user = session.user;
            req.team = session.user.team;

            // Pass to the next middleware
            next();

            // Update session asyncronously
            // (We don't have to wait for session update before printing ouput)
            SessionService.update(session, session.userId, req.ip, req.socket.id, req.data.deviceId, req.data.firebaseToken);

        }
        else {
            // No session found
            next();
        }
    })
    .catch((error) => {
        // Print error only if there is something to print (not just an empty reject)
        // Anyway, the error will be ignored
        if(error) {
            Flux.log.warn('Error while looking for session', error);
        }
        return next();
    });
};
