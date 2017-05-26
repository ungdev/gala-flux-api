const Flux = require('../../Flux');
const { ForbiddenError } = require('../../lib/Errors');

class DeveloperController {

     refresh(req, res) {
        if (!(req.team.can('developer/refresh') )) {
            throw new ForbiddenError('You are not allowed to start a global refresh');
        }

        Flux.io.emit('refresh');

        return res.ok();
    }
}

module.exports = DeveloperController;
