/**
 * BottleController
 *
 * @description :: Server-side logic for managing Bottles
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    /**
     * @api {get} /bottle/find Find all bottles and subscribe to them
     * @apiName find
     * @apiGroup Bottle
     * @apiDescription Get the list of all bottles
     *
     * @apiUse forbiddenError
     *
     * @apiSuccess {Array} Array An array of bottles
     * @apiSuccess {Bottle} Array.bottle A bottle object
     * @apiSuccess {string} Array.bottle.name Complete display name of the bottle
     * @apiSuccess {string} Array.bottle.shortName Short display name of the bottle
     * @apiSuccess {integer} Array.bottle.quantityPerBox Number of bottles per box
     * @apiSuccess {integer} Array.bottle.sellPrice Price at which the bottles are sold in cents
     * @apiSuccess {integer} Array.bottle.supplierPrice Price at which the bottles were bought in cents
     * @apiSuccess {integer} Array.bottle.originalStock Number of bottles at the beginning of the event
     */

    find: function (req, res) {
        // Check permissions
        if(Team.can(req, 'bottle/read') || Team.can(req, 'bottle/admin')) {
            Bottle.find()
                .exec((error, bottle) => {
                    if (error) {
                        return res.negotiate(error);
                    }

                    Bottle.subscribe(req, _.pluck(bottle, 'id'));
                    Bottle.watch(req);

                    return res.ok(bottle);
                });
        }
        else {
            return res.error(403, 'forbidden', 'You are not authorized to view the bottle list');
        }
    },

    /**
     * @api {get} /bottle/find/:id Find one bottle
     * @apiName findOne
     * @apiGroup Bottle
     * @apiDescription Find one bottle based on its id
     *
     * @apiUse forbiddenError
     * @apiUse notFoundError
     *
     * @apiParam {id} id Id of the bottle you are looking for
     *
     * @apiSuccess {Bottle} bottle A bottle object
     * @apiSuccess {string} bottle.name Complete display name of the bottle
     * @apiSuccess {string} bottle.shortName Short display name of the bottle
     * @apiSuccess {integer} bottle.quantityPerBox Number of bottles per box
     * @apiSuccess {integer} bottle.sellPrice Price at which the bottles are sold in cents
     * @apiSuccess {integer} bottle.supplierPrice Price at which the bottles were bought in cents
     * @apiSuccess {integer} bottle.originalStock Number of bottles at the beginning of the event
     */
    findOne: function (req, res) {
        // Check permissions
        if(Team.can(req, 'bottle/read') || Team.can(req, 'bottle/admin')) {

            // Find bottle
            Bottle.findOne({id: req.param('id')})
                .exec((error, bottle) => {
                    if (error) {
                        return res.negotiate(error);
                    }
                    if(!bottle) {
                        return res.error(400, 'BadRequest', 'The requested bottle cannot be found');
                    }

                    Bottle.subscribe(req, [req.param('id')]);

                    return res.ok(bottle);
                });
        }
        else {
            return res.error(403, 'forbidden', 'You are not authorized to read bottle data');
        }
    },

    /**
     * @api {post} /bottle/create Create bottle
     * @apiName create
     * @apiGroup Bottle
     * @apiDescription Create a bottle
     *
     * @apiParam {string} name Complete display name of the bottle you want to edit
     * @apiParam {string} shortName Short display name of the bottle
     * @apiParam {integer} quantityPerBox Number of bottles per box
     * @apiParam {integer} sellPrice Price at which the bottles are sold in cents
     * @apiParam {integer} supplierPrice Price at which the bottles were bought in cents
     * @apiParam {integer} originalStock Number of bottles at the beginning of the event
     *
     * @apiSuccess {Bottle} bottle The bottle you've just created
     *
     * @apiUse badRequestError
     * @apiUse forbiddenError
     */
    create: function (req, res) {
        // Check permissions
        if(!Team.can(req, 'bottle/admin')) {
            return res.error(403, 'forbidden', 'You are not authorized to create a bottle.');
        }

        Bottle.findOne({id: req.param('id')}).exec((error, bottle) => {
            if(bottle) {
                return res.error(400, 'BadRequest', 'Bottle short name is not valid.');
            }

            // Create bottle
            bottle = {};
            if(req.param('name')) bottle.name = req.param('name');
            if(req.param('shortName')) bottle.shortName = req.param('shortName');
            if(req.param('quantityPerBox')) bottle.quantityPerBox = req.param('quantityPerBox');
            if(req.param('sellPrice')) bottle.sellPrice = req.param('sellPrice');
            if(req.param('supplierPrice')) bottle.supplierPrice = req.param('supplierPrice');
            if(req.param('originalStock')) bottle.originalStock = req.param('originalStock');

            Bottle.create(bottle).exec((error, bottle) => {
                if (error) {
                    return res.negotiate(error);
                }

                Bottle.publishCreate(bottle);
                Bottle.subscribe(req, [bottle.id]);

                return res.ok(bottle);
            });
        })
    },

    /**
     * @api {delete} /bottle/:id Delete a bottle
     * @apiName destroy
     * @apiGroup Bottle
     * @apiDescription Delete the given bottle
     *
     * @apiParam {id} id Id of the bottle you want to delete
     *
     * @apiUse badRequestError
     * @apiUse forbiddenError
     * @apiUse notFoundError
     */
    destroy: function (req, res) {
        // Check permissions
        if(!Team.can(req, 'bottle/admin')) {
            return res.error(403, 'forbidden', 'You are not authorized to delete a bottle.');
        }

        // Find bottle
        Bottle.findOne({id: req.param('id')})
            .exec((error, bottle) => {
                if (error) {
                    return res.negotiate(error);
                }
                if(!bottle) {
                    return res.error(400, 'BadRequest', 'The requested bottle cannot be found');
                }
                Bottle.destroy({id: bottle.id}).exec((error) => {
                    if (error) {
                        return res.negotiate(error);
                    }

                    Bottle.publishDestroy(bottle.id);

                    return res.ok();
                });
            });
    },


    /**
     * @api {put} /bottle/:id Update bottle
     * @apiName update
     * @apiGroup Bottle
     * @apiDescription Update the given bottle
     *
     * @apiParam {string} name Complete display name of the bottle you want to edit
     * @apiParam {string} shortName Short display name of the bottle
     * @apiParam {integer} quantityPerBox Number of bottles per box
     * @apiParam {integer} sellPrice Price at which the bottles are sold in cents
     * @apiParam {integer} supplierPrice Price at which the bottles were bought in cents
     * @apiParam {integer} originalStock Number of bottles at the beginning of the event
     *
     * @apiSuccess {Bottle} bottle The bottle you have just updated
     *
     * @apiUse badRequestError
     * @apiUse forbiddenError
     * @apiUse notFoundError
     */
    update: function (req, res) {
        // Check permissions
        if(!Team.can(req, 'bottle/admin')) {
            return res.error(403, 'forbidden', 'You are not authorized to update a bottle.');
        }

        // Find bottle
        Bottle.findOne({id: req.param('id')})
            .exec((error, bottle) => {
                if (error) {
                    return res.negotiate(error);
                }
                if(!bottle) {
                    return res.error(404, 'NotFound', 'The requested bottle cannot be found');
                }

                // Update bottle
                bottle.name = req.param('name', bottle.name);
                bottle.shortName = req.param('shortName', bottle.shortName);
                bottle.quantityPerBox = req.param('quantityPerBox', bottle.quantityPerBox);
                bottle.sellPrice = req.param('sellPrice', bottle.sellPrice);
                bottle.supplierPrice = req.param('supplierPrice', bottle.supplierPrice);
                bottle.originalStock = req.param('originalStock', bottle.originalStock);

                bottle.save((error) => {
                    if (error) {
                        return res.negotiate(error);
                    }
                    Bottle.publishUpdate(bottle.id, bottle);
                    Bottle.subscribe(req, [bottle.id]);

                    return res.ok(bottle);
                });
            });
    },
};

