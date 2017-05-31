const Flux = require('../Flux');
const {NotFoundError, ForbiddenError, BadRequestError} = require('./Errors');

/**
 * Parent controller, contains all default CRUD for a model
 */

class ModelController {

    constructor(model) {
        this._model = model;
    }

    /**
     * @param {Object} filters
     */
    find(req, res) {
        let filters = req.data.filters || true;
        if(!Array.isArray(filters)) {
            filters = [filters];
        }

        let where = {
            $or: this._model.getReadFilters(req.team, req.user),
            $and: { $or: filters }
        };

        this._model.findAll({where,
            order: ['createdAt'],
        })
        .then(res.ok)
        .catch(res.error);
    }

    create(req, res) {
        // Virtually create the new item
        let item = this._model.build(req.data);

        // Check if item group match an user group
        let allowed = false;
        let itemGroups = item.getItemGroups();
        let userGroups = this._model.getUserCreateGroups(req.team, req.user);
        Flux.log.debug('API create of ' + this._model.name + ': item:', itemGroups, '| user:', userGroups)
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
        // Find current item version
        this._model.findById(req.data.id)
        .then(item => {
            if(!item) {
                throw new NotFoundError('The element you want to update cannot be found');
            }

            let userGroups = this._model.getUserUpdateGroups(req.team, req.user);

            // Check if item before update match an user group
            let allowed = false;
            let itemGroups = item.getItemGroups();
            for (let itemGroup of itemGroups) {
                if (userGroups.includes(itemGroup)) {
                    allowed = true;
                    break;
                }
            }
            Flux.log.debug('API update of ' + this._model.name + ': item:', itemGroups, '| user:', userGroups)
            if(!allowed) {
                throw new ForbiddenError('You are not allowed to update this element.');
            }

            // Update item
            item = Object.assign(item, req.data);

            // Check if item after update match an user group
            allowed = false;
            itemGroups = item.getItemGroups();
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
        Flux.log.debug('API destroy of ' + this._model.name);
        // Find current item version
        this._model.findById(req.data.id)
        .then(item => {
            if(!item) {
                throw new NotFoundError('The element you want to destroy cannot be found');
            }

            let userGroups = this._model.getUserDestroyGroups(req.team, req.user);

            // Check if item before update match an user group
            let allowed = false;
            let itemGroups = item.getItemGroups();
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

    subscribe(req, res) {
        if(!req.socket.id) {
            throw new BadRequestError('This endpoint can only be used from a websocket connection');
        }

        // Get user groups and append `model:_model.name` before each
        let rooms = this._model.getUserReadGroups(req.team, req.user).map(room => ('model:' + this._model.name + ':' + room));

        Flux.log.debug('Subscribe ' + this._model.name, rooms);

        // Subscribe socket to each allowed rooms
        req.socket.join(rooms, (err) => {
            if(err) res.error(err);
            res.ok();
        });
    }

    unsubscribe(req, res) {
        if(!req.socket.id) {
            throw new BadRequestError('This endpoint can only be used from a websocket connection');
        }
        Flux.log.debug('Unsubscribe to ' + this._model.name);

        // List joined rooms
        let rooms = Object.keys(req.socket.rooms);

        // Filter for rooms associated witht his model
        rooms = rooms.filter((room) => new RegExp('^model:' + this._model.name + ':').test(room));

        // Execute in promises
        let promises = [];
        for (let room in rooms) {
            promises.push(new Promise((resolve, reject) => {
                req.socket.leave(room, (err) => {
                    if(err) reject(err);
                    resolve();
                });
            }));
        }
        Promise.all(promises)
        .then(res.ok)
        .catch(res.error);
    }
}

module.exports = ModelController;