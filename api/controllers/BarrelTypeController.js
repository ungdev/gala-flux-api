/**
 * BarrelTypeController
 *
 * @description :: Server-side logic for managing BarrelTypes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

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
        if (!(Team.can(req, 'barrelType/admin'))) {
            return res.error(403, 'forbidden', 'You are not authorized to read the barrel types.');
        }

        // Find BarrelType
        BarrelType.find()
            .exec((error, barrelTypes) => {
                if (error) {
                    return res.negotiate(error);
                }

                BarrelType.subscribe(req, _.pluck(barrelTypes, 'id'));
                BarrelType.watch(req);

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

        // Check parameters
        let missingParameters = [];
        if (!req.param('name')) {
            missingParameters.push('name');
        }
        if (!req.param('shortName')) {
            missingParameters.push('shortName');
        }
        if (req.param('liters') === undefined) {
            missingParameters.push('liters');
        }
        if (req.param('supplierPrice') === undefined) {
            missingParameters.push('supplierPrice');
        }
        if (req.param('sellPrice') === undefined) {
            missingParameters.push('sellPrice');
        }
        // return error with missing parameters if there are missing parameters
        if (missingParameters.length) {
            console.log(missingParameters.join(', '));
            return res.error(400, 'BadRequest', 'Unknown parameters : ' + missingParameters.join(', '));
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

            BarrelType.publishCreate(barrelType);
            BarrelType.subscribe(req, [barrelType.id]);

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

                    BarrelType.publishUpdate(barrelType.id, barrelType);
                    BarrelType.subscribe(req, [barrelType.id]);

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
                if (error) {
                    return res.negotiate(error);
                }
                if(!barrelType) {
                    return res.error(404, 'notfound', 'The requested barrel type cannot be found');
                }

                BarrelType.destroy({id: barrelType.id}).exec((error) => {
                    if (error) {
                        return res.negotiate(error);
                    }

                    BarrelType.publishDestroy(barrelType.id);

                    return res.ok();
                });
            });
    },

    /**
     * @api {post} /barreltype/barrel
     * @apiName create barrel
     * @apiGroup BarrelType
     * @apiDescription Create a barrel from a barrel type
     *
     * @apiParam {string} id : The id of the barrel type (required)
     * @apiParam {integer} number : the number of barrels to create (1 by default) (optional)
     *
     * @apiSuccess {Barrel} The created barrel
     *
     * @apiUse badRequestError
     * @apiUse forbiddenError
     * @apiUse notFoundError
     */
    createBarrel: (req, res) => {

        // Check permissions
        if(!Team.can(req, 'barrelType/admin')) {
            return res.error(403, 'forbidden', 'You are not authorized to create new barrels.');
        }

        // check parameters
        if (!req.param('id')) {
            return res.error(400, 'BadRequest', "Missing barrel type id");
        }
        if (req.param('number') && (!Number.isInteger(req.param('number')) || req.param('number') < 1)) {
            return res.error(400, 'BadRequest', "The number of barrels to create must be a positive integer.");
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

            // search the highest num (integer part of the reference) for this type of barrel
            Barrel.find({
                type: barrelType.id
            }).sort({num:-1}).limit(1).exec((error, result) => {
                if (error) {
                    return res.negotiate(error);
                }

                let lastBarrel = result.length ? result[0] : null;

                // get the reference number (0 if there is no barrel of this type)
                let number = lastBarrel && lastBarrel.num ? lastBarrel.num : 0;

                let toInsert = [];
                // prepare the barrels to insert in the database
                const nbBarrelsToCreate = req.param('number') ? req.param('number') : 1;
                for (let i = 0; i < nbBarrelsToCreate ; i++) {
                    number++;
                    toInsert.push({
                        type: barrelType,
                        reference: barrelType.shortName + number,
                        num: number
                    });
                }

                return saveBarrels(toInsert, [], (error, data) => {
                    return error ? res.negotiate(error) : res.ok({data});
                });

            });
        });

    }

};

/**
 * Save an array of barrels recursively
 *
 * @param inputs        => the barrels to save
 * @param outputs       => the barrels saved
 * @param callback      => callback
 * @returns callback
 */
function saveBarrels(inputs, outputs, callback) {

    // get the first element
    let input = inputs.shift();

    // if there is a first element (inputs was not empty)
    if (input) {
        // save this new barrel in the database
        Barrel.create(input).exec((error, barrel) => {
            // if an error happened, call the callback with the error
            if (error) {
                return callback(error);
            }

            // log the new barrel
            BarrelHistory.pushToHistory(barrel, (error, barrelHistory) => {
                // if an error happened, call the callback with the error
                if (error) {
                    return callback(error);
                }

                // save the result and continue
                outputs.push(barrel);
                return saveBarrels(inputs, outputs, callback);

            });

        });
    } else {
        // all the barrels has been saved, exit the function
        return callback(null, outputs);
    }

}