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

    // If socket session
    if (req.socket && req.socket.id) {
        let tmpSession = null;

        // Try to see if there is already a session for this socket
        Flux.Session.findOne({ where: { socketId: req.socket.id }})
        .then(session => {
            if(session) {
                tmpSession = session;

                // find user
                return Flux.User.findById(session.userId);
            }
            else {
                // No session found
                return Promise.reject();
            }
        })
        .then((user) => {
            console.log('not executed');
            if(!user) {
                Flux.warn('User has been deleted.');
                req.user = null;
                return Promise.reject();
            }
            req.user = user;

            // Find team
            return Flux.Team.findById(user.teamId)
        })
        .then(team => {
            if(!team) {
                Flux.warn('We didn\'t find the team associated with the logged in user');
                req.user = null;
                return Promise.reject();
            }

            // Success
            req.team = team;

            // Update session
            return SessionService.update(tmpSession, tmpSession.userId, req.ip, req.socket.id, req.data.deviceId, req.data.firebaseToken);
        })
        .then(() => next())
        .catch((error) => {
            Flux.warn('Error while looking for session', error);
            return next();
        });
    }

    // Http Bearer
    else if (req.headers && req.headers.authorization) {
        let parts = req.headers.authorization.split(/\s+/g);
        if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
            let jwt = parts[1];
            let tmpSession = null;

            SessionService.check(jwt)
            .then(({session, user}) => {
                tmpSession = session;
                req.user = user;
                return Flux.Team.findById(user.teamId)
            })
            .then(team => {
                if(!team) {
                    Flux.warn('We didn\'t find the team associated with the logged in user');
                    req.user = null;
                    return next();
                }

                // Success
                req.team = team;

                // Update session
                return SessionService.update(tmpSession, tmpSession.userId, req.ip, req.socket.id, req.data.deviceId, req.data.firebaseToken);
            })
            .then(() => next())
            .catch((error) => {
                Flux.warn('The given JWT is not valid', error);
                return next();
            });

        } else {
            Flux.warn('Authentication header found but not in the expected bearer format. Exepected `Authorization: Bearer [token]`');
            return next();
        }
    }
    else {
        return next();
    }
};
