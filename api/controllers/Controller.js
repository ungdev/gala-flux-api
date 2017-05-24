const Flux = require('../../Flux');

/**
 * Parent controller, contains all default CRUD
 */
let _model;

class Controller {

    static find(model, req, res) {

        let where = model.getFilters(req.team, req.user);
        if (req.query.filter) {
            where = {
                $or: where,
                $and: { $or: JSON.parse(unescape(req.query.filter)) || {} }
            };
        }

        model.findAll({where})
        .then(res.ok)
        .catch(res.error500);
    }
};

module.exports = Controller;
