/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var jwt = require('jsonwebtoken');

module.exports = {

    /**
     * `UserController.ipLogin()`
     */
    ipLogin: function (req, res) {

        User.attemptIpLogin({
            ip: req.ip,
        }, function (err, user) {
            if (err) {
                return res.negotiate(err);
            }
            if (!user) {
                return res.json(401, {err: 'Unknown IP'});
            }
            if (!user.team) {
                return res.json(401, {err: 'Account not associated with a team'});
            }
            return res.ok(jwt.sign(
                {user: user.id},
                sails.config.jwt.secret,
                {expiresIn: sails.config.jwt.expiresIn}
            ));
        });
    },
};
