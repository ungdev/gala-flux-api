
/**
 * jwtAuth
 *
 * @module      :: Policy
 * @description :: Policy that verify jwt token and expose
 * user as `req.user` and team as `req.team`
 *
 */
module.exports = function (req, res, next) {
    if(!req.user || !req.team) {
        return res.error(401, 'Unauthorized', 'You have to be authenticated to access this endpoint. If you see this message after authentication, then your authentication failed, see server log for details.');
    }
    return next();
};
