/**
 * BarrelController
 *
 * @description :: Server-side logic for managing Barrels
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    /**
     * @api {get} /barrel
     * @apiName find
     * @apiGroup Barrel
     * @apiDescription Get the list of all barrel according to permissions.
     *
     * @apiSuccess {Array} An array of barrel
     *
     * @apiUse forbiddenError
     */
    find: (req, res) => {

        // Check permissions
        if (!(Team.can(req, 'barrel/admin') || Team.can(req, 'barrel/restricted'))) {
            return res.error(403, 'forbidden', 'You are not authorized to read barrels.');
        }

        // if the requester is not admin, show only his team's barrels
        let where = {};
        if (!(Team.can(req, 'barrel/admin'))) {
            where.place = req.team;
        }

        // Find barrels
        Barrel.find(where)
            .exec((error, barrels) => {
                if (error) {
                    return res.negotiate(error);
                }

                Barrel.subscribe(req, _.pluck(barrels, 'id'));
                Barrel.watch(req);

                return res.ok(barrels);
            });

    },

};

