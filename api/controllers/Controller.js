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
                $and: { $or: req.data || {} }
            };
        }

        model.findAll({where})
        .then(res.ok)
        .catch((error) => {
            res.error500(error);
        });
    }
}

module.exports = Controller;
