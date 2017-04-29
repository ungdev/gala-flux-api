/**
 * BottleTypeTypeController
 *
 * @description :: Server-side logic for managing BottleTypes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    /**
     * @api {get} /bottletype/find Find all bottletypes and subscribe to them
     * @apiName find
     * @apiGroup BottleType
     * @apiDescription Get the list of all bottletypes
     *
     * @apiUse forbiddenError
     *
     * @apiSuccess {Array} Array An array of bottletypes
     * @apiSuccess {BottleType} Array.bottletype A bottletype object
     * @apiSuccess {string} Array.bottletype.name Complete display name of the bottletype
     * @apiSuccess {string} Array.bottletype.shortName Short display name of the bottletype
     * @apiSuccess {integer} Array.bottletype.quantityPerBox Number of bottletypes per box
     * @apiSuccess {integer} Array.bottletype.sellPrice Price at which the bottletypes are sold in cents
     * @apiSuccess {integer} Array.bottletype.supplierPrice Price at which the bottletypes were bought in cents
     * @apiSuccess {integer} Array.bottletype.originalStock Number of bottletypes at the beginning of the event
     */

    find: function (req, res) {
        // Check permissions
        if(Team.can(req, 'bottleType/read') || Team.can(req, 'bottleType/admin')) {
            BottleType.find()
                .exec((error, bottletype) => {
                    if (error) {
                        return res.negotiate(error);
                    }

                    BottleType.subscribe(req, _.pluck(bottletype, 'id'));
                    BottleType.watch(req);

                    return res.ok(bottletype);
                });
        }
        else {
            return res.error(403, 'forbidden', 'You are not authorized to view the bottletype list');
        }
    },

    /**
     * @api {get} /bottletype/find/:id Find one bottletype
     * @apiName findOne
     * @apiGroup BottleType
     * @apiDescription Find one bottletype based on its id
     *
     * @apiUse forbiddenError
     * @apiUse notFoundError
     *
     * @apiParam {id} id Id of the bottletype you are looking for
     *
     * @apiSuccess {BottleType} bottletype A bottletype object
     * @apiSuccess {string} bottletype.name Complete display name of the bottletype
     * @apiSuccess {string} bottletype.shortName Short display name of the bottletype
     * @apiSuccess {integer} bottletype.quantityPerBox Number of bottletypes per box
     * @apiSuccess {integer} bottletype.sellPrice Price at which the bottletypes are sold in cents
     * @apiSuccess {integer} bottletype.supplierPrice Price at which the bottletypes were bought in cents
     * @apiSuccess {integer} bottletype.originalStock Number of bottletypes at the beginning of the event
     */
    findOne: function (req, res) {
        // Check permissions
        if(Team.can(req, 'bottleType/read') || Team.can(req, 'bottleType/admin')) {

            // Find bottletype
            BottleType.findOne({id: req.param('id')})
                .exec((error, bottletype) => {
                    if (error) {
                        return res.negotiate(error);
                    }
                    if(!bottletype) {
                        return res.error(400, 'BadRequest', 'The requested bottletype cannot be found');
                    }

                    BottleType.subscribe(req, [req.param('id')]);

                    return res.ok(bottletype);
                });
        }
        else {
            return res.error(403, 'forbidden', 'You are not authorized to read bottletype data');
        }
    },

    /**
     * @api {post} /bottletype/create Create bottletype
     * @apiName create
     * @apiGroup BottleType
     * @apiDescription Create a bottletype
     *
     * @apiParam {string} name Complete display name of the bottletype you want to edit
     * @apiParam {string} shortName Short display name of the bottletype
     * @apiParam {integer} quantityPerBox Number of bottletypes per box
     * @apiParam {integer} sellPrice Price at which the bottletypes are sold in cents
     * @apiParam {integer} supplierPrice Price at which the bottletypes were bought in cents
     * @apiParam {integer} originalStock Number of bottletypes at the beginning of the event
     *
     * @apiSuccess {BottleType} bottletype The bottletype you've just created
     *
     * @apiUse badRequestError
     * @apiUse forbiddenError
     */
    create: function (req, res) {
        // Check permissions
        if(!Team.can(req, 'bottleType/admin')) {
            return res.error(403, 'forbidden', 'You are not authorized to create a bottletype.');
        }

        BottleType.findOne({id: req.param('id')}).exec((error, bottletype) => {
            if(bottletype) {
                return res.error(400, 'BadRequest', 'BottleType short name is not valid.');
            }

            // Create bottletype
            bottletype = {};
            if(req.param('name')) bottletype.name = req.param('name');
            if(req.param('shortName')) bottletype.shortName = req.param('shortName');
            if(req.param('quantityPerBox')) bottletype.quantityPerBox = req.param('quantityPerBox');
            if(req.param('sellPrice')) bottletype.sellPrice = req.param('sellPrice');
            if(req.param('supplierPrice')) bottletype.supplierPrice = req.param('supplierPrice');
            if(req.param('originalStock')) bottletype.originalStock = req.param('originalStock');

            BottleType.create(bottletype).exec((error, bottletype) => {
                if (error) {
                    return res.negotiate(error);
                }

                BottleType.publishCreate(bottletype);
                BottleType.subscribe(req, [bottletype.id]);

                return res.ok(bottletype);
            });
        })
    },

    /**
     * @api {delete} /bottletype/:id Delete a bottletype
     * @apiName destroy
     * @apiGroup BottleType
     * @apiDescription Delete the given bottletype
     *
     * @apiParam {id} id Id of the bottletype you want to delete
     *
     * @apiUse badRequestError
     * @apiUse forbiddenError
     * @apiUse notFoundError
     */
    destroy: function (req, res) {
        // Check permissions
        if(!Team.can(req, 'bottleType/admin')) {
            return res.error(403, 'forbidden', 'You are not authorized to delete a bottletype.');
        }

        // Find bottletype
        BottleType.findOne({id: req.param('id')})
            .exec((error, bottletype) => {
                if (error) {
                    return res.negotiate(error);
                }
                if(!bottletype) {
                    return res.error(400, 'BadRequest', 'The requested bottletype cannot be found');
                }
                BottleType.destroy({id: bottletype.id}).exec((error) => {
                    if (error) {
                        return res.negotiate(error);
                    }

                    BottleType.publishDestroy(bottletype.id);

                    return res.ok();
                });
            });
    },


    /**
     * @api {put} /bottletype/:id Update bottletype
     * @apiName update
     * @apiGroup BottleType
     * @apiDescription Update the given bottletype
     *
     * @apiParam {string} name Complete display name of the bottletype you want to edit
     * @apiParam {string} shortName Short display name of the bottletype
     * @apiParam {integer} quantityPerBox Number of bottletypes per box
     * @apiParam {integer} sellPrice Price at which the bottletypes are sold in cents
     * @apiParam {integer} supplierPrice Price at which the bottletypes were bought in cents
     * @apiParam {integer} originalStock Number of bottletypes at the beginning of the event
     *
     * @apiSuccess {BottleType} bottletype The bottletype you have just updated
     *
     * @apiUse badRequestError
     * @apiUse forbiddenError
     * @apiUse notFoundError
     */
    update: function (req, res) {
        // Check permissions
        if(!Team.can(req, 'bottleType/admin')) {
            return res.error(403, 'forbidden', 'You are not authorized to update a bottletype.');
        }

        // Find bottletype
        BottleType.findOne({id: req.param('id')})
            .exec((error, bottletype) => {
                if (error) {
                    return res.negotiate(error);
                }
                if(!bottletype) {
                    return res.error(404, 'NotFound', 'The requested bottletype cannot be found');
                }

                // Update bottletype
                bottletype.name = req.param('name', bottletype.name);
                bottletype.shortName = req.param('shortName', bottletype.shortName);
                bottletype.quantityPerBox = req.param('quantityPerBox', bottletype.quantityPerBox);
                bottletype.sellPrice = req.param('sellPrice', bottletype.sellPrice);
                bottletype.supplierPrice = req.param('supplierPrice', bottletype.supplierPrice);
                bottletype.originalStock = req.param('originalStock', bottletype.originalStock);

                bottletype.save((error) => {
                    if (error) {
                        return res.negotiate(error);
                    }
                    BottleType.publishUpdate(bottletype.id, bottletype);
                    BottleType.subscribe(req, [bottletype.id]);

                    return res.ok(bottletype);
                });
            });
    },
};

