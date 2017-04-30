/**
 * BarrelTypeController
 *
 * @description :: Server-side logic for managing BarrelTypes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    /**
     * @api {post} /barreltype/subscribe Subscribe to new items
     * @apiName subscribe
     * @apiGroup BarrelType
     * @apiDescription Subscribe to all new items.
     */
    subscribe: function(req, res) {
        if(Team.can(req, 'barrelType/read') || Team.can(req, 'barrelType/admin')) {
            BarrelType.watch(req);
            BarrelType.find().exec((error, items) => {
                if(error) return res.negotiate(error);
                BarrelType.subscribe(req, _.pluck(items, 'id'));
                return res.ok();
            });
        }
        else {
            return res.ok();
        }
    },

    /**
     * @api {post} /barreltype/unsubscribe Unsubscribe from new items
     * @apiName subscribe
     * @apiGroup BarrelType
     * @apiDescription Unsubscribe from new items
     */
    unsubscribe: function(req, res) {
        BarrelType.unwatch(req);
        BarrelType.find().exec((error, items) => {
            if(error) return res.negotiate(error);
            BarrelType.unsubscribe(req, _.pluck(items, 'id'));
            return res.ok();
        });
    },

    /**
     * @api {get} /barreltype
     * @apiName find
     * @apiGroup BarrelType
     * @apiDescription Get the list of all barrel types according to permissions.
     *
     * @apiSuccess {Array} An array of barrel type
     *
     * @apiUse forbiddenError
     */
    find: (req, res) => {

        // Check permissions
        if (!Team.can(req, 'barrelType/admin') && !Team.can(req, 'barrelType/read')) {
            return res.error(403, 'forbidden', 'You are not authorized to read the barrel types.');
        }

        // read filters
        let where = {};
        if (req.allParams().filters) {
            where = req.allParams().filters;
        }

        // Find BarrelType
        BarrelType.find(where)
            .exec((error, barrelTypes) => {
                if (error) {
                    return res.negotiate(error);
                }

                return res.ok(barrelTypes);
            });

    },

    /**
     * @api {post} /barreltype
     * @apiName create
     * @apiGroup Barrel Type
     * @apiDescription Create a new barrel type
     *
     * @apiParam {string} name : The name of the contents of the barrel (required)
     * @apiParam {string} shortName : A short unique code from the name of the contents (required)
     * @apiParam {integer} liters : The amount of drink in the barrel (required)
     * @apiParam {float} supplierPrice : purchasing price (required)
     * @apiParam {float} sellPrice : sell price(required)
     *
     * @apiSuccess {BarrelType} The alert button that you've just created
     *
     * @apiUse badRequestError
     * @apiUse forbiddenError
     */
    create: (req, res) => {

        // Check permissions
        if (!Team.can(req, 'barrelType/admin')) {
            return res.error(403, 'forbidden', 'You are not authorized to create an Barrel Type.');
        }

        // Create the BarrelType
        BarrelType.create({
            name: req.param('name'),
            shortName: req.param('shortName'),
            liters: req.param('liters'),
            supplierPrice: req.param('supplierPrice'),
            sellPrice: req.param('sellPrice')
        }).exec((error, barrelType) => {
            if (error) {
                return res.negotiate(error);
            }
            return res.ok(barrelType);
        });

    },

    /**
     * @api {put} /barreltype/:id
     * @apiName update
     * @apiGroup BarrelType
     * @apiDescription Update the given barrel type
     *
     * @apiParam {string} id : Id of the barrel type to edit (required)
     * @apiParam {string} name : The name of the contents of the barrel (optional)
     * @apiParam {string} shortName : A short unique code from the name of the contents (optional)
     * @apiParam {integer} liters : The amount of drink in the barrel (optional)
     * @apiParam {float} supplierPrice : purchasing price (optional)
     * @apiParam {float} sellPrice : sell price(optional)
     *
     * @apiSuccess {BarrelType} The barrel type that you've just updated
     *
     * @apiUse forbiddenError
     * @apiUse notFoundError
     */
    update: (req, res) => {

        // Check permissions
        if (!Team.can(req, 'barrelType/admin')) {
            return res.error(403, 'forbidden', 'You are not authorized to update a Barrel Type.');
        }

        // Find the barrel type
        BarrelType.findOne({id: req.param('id')})
            .exec((error, barrelType) => {
                if (error) {
                    return res.negotiate(error);
                }
                if(!barrelType) {
                    return res.error(404, 'notfound', 'The requested barrel type cannot be found');
                }

                // Update
                barrelType.name = req.param('name', barrelType.name);
                barrelType.shortName = req.param('shortName', barrelType.shortName);
                barrelType.liters = req.param('liters', barrelType.liters);
                barrelType.sellPrice = req.param('sellPrice', barrelType.sellPrice);
                barrelType.supplierPrice = req.param('supplierPrice', barrelType.supplierPrice);

                barrelType.save((error) => {
                    if (error) {
                        return res.negotiate(error);
                    }

                    return res.ok(barrelType);
                });

            });

    },

    /**
     * @api {delete} /barreltype/:id
     * @apiName destroy
     * @apiGroup BarrelType
     * @apiDescription Delete the given BarrelType
     *
     * @apiParam {string} id : Id of the barrel type to delete
     *
     * @apiUse forbiddenError
     * @apiUse notFoundError
     */
    destroy: function (req, res) {

        // Check permissions
        if(!Team.can(req, 'barrelType/admin')) {
            return res.error(403, 'forbidden', 'You are not authorized to delete a barrel type.');
        }

        // Find the barrel type
        BarrelType.findOne({id: req.param('id')})
            .exec((error, barrelType) => {
                if (error) return res.negotiate(error);

                if(!barrelType) {
                    return res.error(404, 'notfound', 'The requested barrel type cannot be found');
                }

                BarrelType.destroy({id: barrelType.id})
                    .exec((error) => {
                        if (error) return res.negotiate(error);

                        return res.ok();
                    });
            });
    },

    /**
     * @api {post} /barreltype/barrel
     * @apiName Set barrel count
     * @apiGroup BarrelType
     * @apiDescription Set the number of barrels from a barrel type
     *
     * @apiParam {string} id : The id of the barrel type (required)
     * @apiParam {integer} number : the number of barrels to set for this Type
     *
     * @apiSuccess {null} This endpoint return nothing, if you want to whole new list of barrel ask `find`
     *
     * @apiUse badRequestError
     * @apiUse forbiddenError
     * @apiUse notFoundError
     */
    setBarrelNumber: (req, res) => {

        // Check permissions
        if(!Team.can(req, 'barrelType/admin')) {
            return res.error(403, 'forbidden', 'You are not authorized to create new barrels.');
        }

        // check parameters
        if (!req.param('id')) {
            return res.error(400, 'BadRequest', "Missing barrel type id");
        }
        if (req.param('number') && (parseInt(req.param('number')) < 0 || parseInt(req.param('number')) > 500)) {
            return res.error(400, 'BadRequest', "The number of barrels to create must be a positive integer (less than 500).");
        }

        // get the barrel type
        BarrelType.findOne({
            'id': req.param('id')
        }).exec((error, barrelType) => {
            if (error) {
                return res.negotiate(error);
            }

            // If the barrel type doesn't exists, throw error
            if (!barrelType) {
                return res.error(404, 'notFound', "Can't find the requested barrel type.");
            }

            // Get current list of barrel
            Barrel.find({
                type: barrelType.id
            }).exec((error, barrels) => {
                if (error) {
                    return res.negotiate(error);
                }

                // Insert if the barrel doesn't exists
                let toInsert = [];
                for (let i = 1; i <= parseInt(req.param('number')); i++) {
                    // Find in barrel list
                    let found = false;
                    for (let index in barrels) {
                        if(barrels[index].num == i) {
                            found = true;
                            delete barrels[index];
                            break;
                        }
                    }

                    // If not found, add to insert list
                    if(!found) {
                        toInsert.push({
                            type: req.param('id'),
                            num: i,
                            reference: barrelType.shortName + i,
                        })
                    }
                }

                // Add id of what's left to the delete list
                let toDelete = [];
                for (let barrel of barrels) {
                    if(barrel) {
                        toDelete.push(barrel.id);
                    }
                }

                // Insert
                Barrel.create(toInsert).exec((error, barrels) => {
                    if (error) {
                        return res.negotiate(error);
                    }

                    // log the list of new barrels
                    BarrelHistory.pushToHistory(barrels, (error, barrelHistory) => {
                        // if an error happened, call the callback with the error
                        if (error) {
                            return res.negotiate(error);
                        }

                        // Delete what's left
                        Barrel.destroy({id: toDelete}).exec((error) => {
                            if (error) {
                                return res.negotiate(error);
                            }

                            return res.ok();
                        });
                    });
                });
            });
        });
    }
};
