const JWTService = require('../services/JWTService');
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

    // If socket already authenticated
    // TODO change for database session based detection
    if (req.socket && req.socket.jwt) {
        // jwt = req.socket.jwt;
        // Session.findOne({socketId: req.socket.id}).exec((err, session) => {
        //     if (err) return res.negotiate(error);
        //
        //     // if session exist, update lastAction
        //     if (session) {
        //         session.lastAction = Date.now();
        //         session.save(err => {
        //             if (err) return res.negotiate(error);
        //
        //             AlertService.checkTeamActivity(user.team);
        //             return next();
        //         });
        //     } else {
        //         AlertService.checkTeamActivity(user.team);
        //         return next();
        //     }
        // });
    }

    // Http Bearer
    else if (req.headers && req.headers.authorization) {
        let parts = req.headers.authorization.split(' ');
        if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
            let jwt = parts[1];

            JWTService.verify(jwt)
            .then(user => {
                req.user = user;
                return Flux.Team.findOne({ where: {id: user.teamId}})
            })
            .then(team => {
                if(!team) {
                    Flux.warn('We didn\'t find the team associated with the logged in user');
                    return next();
                }

                // Success
                req.team = team;
                return next();
            })
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
