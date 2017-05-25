const Flux = require('../../Flux');
const {NotFoundError, ForbiddenError} = require('../../lib/Errors');

/**
 * Parent controller, contains all default CRUD
 */

class Controller {

    constructor(model) {
        this._model = model;
    }

    /**
     * @param {Object} filters
     */
    find(req, res) {
        let filters = req.data.filters || {true: true};
        if(!Array.isArray(filters)) {
            filters = [filters];
        }

        let where = {
            $or: this._model.getReadFilters(req.team, req.user),
            $and: { $or: filters }
        };

        this._model.findAll(where)
        .then(res.ok)
        .catch(res.error);
    }

    create(req, res) {
        // Virtually create the new item
        let item = this._model.build(req.data);

        // Check if item group match an user group
        let allowed = false;
        let itemGroups = item.getCreateGroups();
        let userGroups = this._model.getUserCreateGroups(req.team, req.user);
        Flux.debug('item:', itemGroups, '| user:', userGroups)
        for (let itemGroup of itemGroups) {
            if (userGroups.includes(itemGroup)) {
                allowed = true;
                break;
            }
        }
        if(!allowed) {
            throw new ForbiddenError('You are not allowed to create this element.');
        }


        // Submit
        item.save()
        .then(res.ok)
        .catch(res.error);
    }

    update(req, res) {
        Flux.info('Update');
        // Find current item version
        this._model.findById(req.data.id)
        .then(item => {
            if(!item) {
                throw new NotFoundError('The element you want to update cannot be found');
            }

            let userGroups = this._model.getUserUpdateGroups(req.team, req.user);

            // Check if item before update match an user group
            let allowed = false;
            let itemGroups = item.getUpdateGroups();
            for (let itemGroup of itemGroups) {
                if (userGroups.includes(itemGroup)) {
                    allowed = true;
                    break;
                }
            }
            if(!allowed) {
                throw new ForbiddenError('You are not allowed to update this element.');
            }

            // Update item
            item = Object.assign(item, req.data);

            // Check if item after update match an user group
            allowed = false;
            itemGroups = item.getUpdateGroups();
            for (let itemGroup of itemGroups) {
                if (userGroups.includes(itemGroup)) {
                    allowed = true;
                    break;
                }
            }
            if(!allowed) {
                throw new ForbiddenError('You are not allowed to update this element to this value.');
            }

            // Submit
            return item.save();
        })
        .then(res.ok)
        .catch(res.error);
    }

    destroy(req, res) {
        Flux.info('Destroy', req.data);
        // Find current item version
        this._model.findById(req.data.id)
        .then(item => {
            if(!item) {
                throw new NotFoundError('The element you want to destroy cannot be found');
            }

            let userGroups = this._model.getUserDestroyGroups(req.team, req.user);

            // Check if item before update match an user group
            let allowed = false;
            let itemGroups = item.getDestroyGroups();
            for (let itemGroup of itemGroups) {
                if (userGroups.includes(itemGroup)) {
                    allowed = true;
                    break;
                }
            }
            if(!allowed) {
                throw new ForbiddenError('You are not allowed to destroy this element.');
            }

            // Destroy item
            item = Object.assign(item, req.data);

            // Submit
            return item.destroy();
        })
        .then(res.ok)
        .catch(res.error);
    }
}

module.exports = Controller;
