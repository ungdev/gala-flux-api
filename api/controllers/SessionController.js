const Flux = require('../../Flux');
const ModelController = require('../../lib/ModelController');

class SessionController extends ModelController {

    constructor() {
        super(Flux.Session);
    }

    /**
     * @api {post} /user/subscribe Subscribe to new items
     * @apiName subscribe
     * @apiGroup User
     * @apiDescription Subscribe to all new items.
     */
    // subscribe(req, res) {}


    /**
     * @api {post} /user/unsubscribe Unsubscribe from new items
     * @apiName subscribe
     * @apiGroup User
     * @apiDescription Unsubscribe from new items
     */
    // unsubscribe(req, res) {}
}

module.exports = SessionController;
