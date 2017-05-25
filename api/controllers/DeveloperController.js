/**
 * SessionController
 *
 * @description :: Server-side logic for managing Sessions
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

class DeveloperController {

     refresh(req, res) {
        if (!(req.team.can('developer/refresh') )) {
            return res.error(403, 'forbidden', "You are not allowed to start a global refresh");
        }

        sails.sockets.blast('refresh');

        return res.ok();
    }
};

module.exports = DeveloperController;
