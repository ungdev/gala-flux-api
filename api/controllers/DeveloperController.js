/**
 * SessionController
 *
 * @description :: Server-side logic for managing Sessions
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    refresh: function(req, res) {
        if (!(Team.can(req, 'developer/refresh') )) {
            return res.error(403, 'forbidden', "You are not allowed to start a global refresh");
        }

        sails.sockets.blast('refresh');

        return res.ok();
    },
};
