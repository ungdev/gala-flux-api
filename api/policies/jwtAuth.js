/**
 * jwtAuth
 *
 * @module      :: Policy
 * @description :: Policy that verify jwt token and expose
 * user as `req.user` and team as `req.team`
 *
 */
module.exports = function (req, res, next) {
    let jwt;

    // If socket already authenticated
    if (req.socket && req.socket.jwt) {
        jwt = req.socket.jwt;
    }

    // Http Bearer
    else if (req.headers && req.headers.authorization) {

        let parts = req.headers.authorization.split(' ');

        if (parts.length === 2) {

            let scheme = parts[0],
            credentials = parts[1];

            if (/^Bearer$/i.test(scheme)) {
                jwt = credentials;
            }

        } else {
            return res.error(401, 'AuthBadFormat', 'Bearer format is http header `Authorization: Bearer [token]`');
        }
    } else {
        return res.error(401, 'AuthRequired', 'We couldn\'t find the JWT required to authenticate your request');
    }


    JwtService.verify(jwt)
        .then((user) => {
            req.user = user;
            Team.findOne({id: user.team}).exec((error, team) => {
                if(error) {
                    return res.error(500, 'NoTeam', 'We didn\'t find the team associated with the logged in user');
                }
                user.lastConnection = Date.now();
                user.save((error) => {
                    if (error) {
                        return res.negotiate(error);
                    }
                    AlertService.checkTeamActivity(user.team);
                    req.team = team;
                    return next();
                });
            });
        })
        .catch((error) => {
            return res.error(500, 'InvalidJwt', 'The given JWT is not valid : ' + error);
        })
};
