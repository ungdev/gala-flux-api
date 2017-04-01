/**
 * BottleController
 *
 * @description :: Server-side logic for managing Bottles
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {


    find: function (req, res) {
        if(Team.can(req, 'user/read') || Team.can(req, 'user/admin')) {
            Bottle.find()
                .exec((error, bottle) => {
                    if (error) {
                        return res.negotiate(error);
                    }

                    Bottle.subscribe(req, _.pluck(bottle, 'shortName'));
                    Bottle.watch(req);

                    return res.ok(bottle);
                });
        }
        else {
            return res.error(403, 'forbidden', 'You are not authorized read user list');
        }
    },

    create: function (req, res) {
        // Check permissions
        if(!Team.can(req, 'user/admin') && !Team.can(req, 'user/team')) { //&& req.param('team') == req.team.id)) { je pense que cette condition ne s'applique pas aux bouteilles
            return res.error(403, 'forbidden', 'You are not authorized to create a bottle in this team.');
        }

        // Check parameters
        if(!req.param('name') && !req.param('shortName') && !req.param('quantityPerBox') && !req.param('sellPrice') && !req.param('supplierPrice') && !req.param('originalStock')) {
            return res.error(400, 'BadRequest', 'All fields have to be set.');
        }
        Team.findOne({id: req.param('team')}).exec((error, team) => {
            if(!team) {
                return res.error(400, 'BadRequest', 'Team id is not valid.');
            }

            // Create bottle
            let bottle = {};
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
                Bottle.subscribe(req, [bottle.shortName]); // A quoi correspond cette fonction ?

                return res.ok(bottle);
            });
        })
    },

    // Have a look at what's below
    // It can't work for now because it uses findOne which isn't implemented yet
    /* destroy: function (req, res) {
        // Check permissions 1
        if(!Team.can(req, 'user/admin') && !(Team.can(req, 'user/team'))) {
            return res.error(403, 'forbidden', 'You are not authorized to update a bottle.');
        }

        // Find user
        Bottle.findOne({shortName: req.param('shortName')})
            .exec((error, bottle) => {
                if (error) {
                    return res.negotiate(error);
                }
                if(!bottle) {
                    return res.error(404, 'notfound', 'The requested bottle cannot be found');
                }

                // I don't think this 'if' is needed
                // Check permissions 2
                if(Team.can(req, 'user/team') && user.team != req.team.id) {
                    return res.error(403, 'forbidden', 'You are not authorized to delete an user from this team.');
                }


                Bottle.destroy({shortName: bottle.shortName}).exec((error) => {
                    if (error) {
                        return res.negotiate(error);
                    }

                    Bottle.publishDestroy(bottle.shortName);

                    return res.ok();
                });
            });
    }, */

};

