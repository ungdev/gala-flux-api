/**
 * BarrelTypeController
 *
 * @description :: Server-side logic for managing Barreltypes
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
        if (!Team.can(req, 'alertButton/admin')) {
            return res.error(403, 'forbidden', 'You are not authorized to create an Alert button.');
        }

        // Check parameters
        let missingParameters = [];
        if (!req.param('name')) {
            missingParameters.push('name');
        }
        if (!req.param('shortName')) {
            missingParameters.push('shortName');
        }
        if (!req.param('liters')) {
            missingParameters.push('message');
        }
        if (!req.param('supplierPrice')) {
            missingParameters.push('supplierPrice');
        }
        if (!req.param('sellPrice')) {
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

};

