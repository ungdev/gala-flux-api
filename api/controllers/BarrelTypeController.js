/**
 * BarrelTypeController
 *
 * @description :: Server-side logic for managing Barreltypes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

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

    }

};

