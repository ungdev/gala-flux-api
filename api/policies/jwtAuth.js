/**
 * sessionAuth
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */



module.exports = function (req, res, next) {
    let jwt;

    // If socket already authenticated
    if(req.socket && req.socket.jwt) {
        jwt = req.socket.jwt;
    }

    // Http Bearer
    else if (req.headers && req.headers.authorization) {

        let parts = req.headers.authorization.split(' ');

        if (parts.length == 2) {

            let scheme = parts[0],
            credentials = parts[1];

            if (/^Bearer$/i.test(scheme)) {
                jwt = credentials;
            }

        } else {
            return res.error(401, 'AuthBadFormat', 'Bearer format is http header `Authorization: Bearer [token]`');
        }
    }
    else {
        return res.error(401, 'AuthRequired', 'We couldn\'t find the JWT required to authenticate your request');
    }


    JwtService.verify(jwt)
    .then((user) => {
        req.user = user;
        return next();
    })
};
