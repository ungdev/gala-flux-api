const Flux = require('../../Flux');
const { ExpectedError } = require('../../lib/Errors');
const ModelController = require('../../lib/ModelController');

class BarrelController extends ModelController {

    constructor() {
        super(Flux.Barrel);
    }

    /**
     * @api {post} /barrel/subscribe Subscribe to new items
     * @apiName subscribe
     * @apiGroup Barrel
     * @apiDescription Subscribe to all new items.
     */
    //  subscribe(req, res) {}

    /**
     * @api {post} /barrel/unsubscribe Unsubscribe from new items
     * @apiName subscribe
     * @apiGroup Barrel
     * @apiDescription Unsubscribe from new items
     */
    //  unsubscribe(req, res) {}

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
    //  find(req, res) {}

    /**
     * @api {put} /barrel/:id
     * @apiName update
     * @apiGroup Barrel
     * @apiDescription Update the given barrel
     *
     * @apiParam {string} id : Id of the barrel to edit (required)
     * @apiParam {string} state : The new barrel state (required)
     *
     * @apiSuccess {Barrel} The barrel that you've just updated
     *
     * @apiUse forbiddenError
     * @apiUse notFoundError
     */
     update(req, res) {}

    /**
     * @api {put} /barrel/location
     * @apiName updateLocation
     * @apiGroup Barrel
     * @apiDescription update the location of a list of barrels
     *
     * @apiParam {Array} barrels: The barrels to update
     * @apiParem {string} location: the new location
     *
     * @apiUse forbiddenError
     * @apiUse notFoundError
     */
     setLocation(req, res) {

        // check permissions
        if (!(req.team.can('barrel/admin'))) {
            return res.error(403, 'forbidden', "You are not authorized to update barrels's location.");
        }

        // check team
        Team.findOne({id: req.param('location')})
        .exec((error, team) => {
            if (error) return res.negotiate(error);

            // if the location is not the log (null) and the asked team can't be found, return error
            if (req.param('location') !== null && req.param('location') !== "null" && !team) {
                return res.error(403, 'forbidden', "The location is not valid.");
            }

            // prepare each update
            let promises = [];
            for (let i in req.param('barrels')) {
                promises.push(new Promise((resolve, reject) => {
                    Barrel.findOne({id: req.param('barrels')[i].id})
                        .then(barrel => {
                            // update his location and save it
                            barrel.place = req.param('location');
                            barrel.save(error => {
                                if (error) return reject(error);

                                // log the barrel state
                                BarrelLog.pushToHistory(barrel, (error, barrelHistory) => {
                                    if (error) return reject(error);


                                    checkTeamStocks(barrel);

                                    return resolve(barrel.id);

                                });
                            });
                        })
                        .catch(error => reject(error));
                }));
            }

            // run all promises
            Promise.all(promises)
            .then(ids => {

                return res.ok();
            })
            .catch(error => res.negotiate(error));
        });
    }
};

/**
 * Check the remaining barrels of this type for the concerned bar.
 * If 1 : send warning alert
 * If 0 : send serious alert
 *
 * @param barrel
 */
function checkTeamStocks(barrel) {

    // if there is a team, get all his barrels of this type
    if (barrel.place) {

        BarrelType.findOne({
            id: barrel.type
        })
        .exec((error, type) => {
            if (error) return;

            // count how many new barrel of this type this the team still have
            Barrel.count({
                place: barrel.place,
                type: type.id,
                state: "new"
            })
            .exec((error, count) => {
                if (error) return;

                // Before emitting a new alert remove old one about this barrel
                Alert.destroy({
                    title: 'Fût : ' + type.name + ' (' + type.shortName + ')',
                    severity: ['warning', 'serious'],
                    category: 'Manque auto',
                    sender: barrel.place,
                })
                .exec((error) => {
                    if (error) return;

                    // if 1 or 0 remaining, create alert
                    if (count < 2) {
                        Alert.create({
                            sender: barrel.place,
                            severity: count === 1 ? 'warning' : 'serious',
                            title: 'Fût : ' + type.name + ' (' + type.shortName + ')',
                            message: ((count === 1) ? 'Avant-dernier fût entammé' : 'Dernier fût entammé'),
                            category: 'Manque auto',
                        })
                        .exec((error, alert) => {
                            if (error) return;

                            // push this modification in the alert history
                            AlertLog.pushToHistory(alert, (error, result) => {
                                if (error) return;
                            });

                        });
                    }
                });
            });

        });
    }
}

/**
 * Save a barrel and push it to the history
 *
 * @param {object} barrel: the barrel to save
 * @param {object} req: the request
 * @param {object} res: the response
 * @param {boolean} checkState: true if the barrel's team stocks have to be check
 */
function updateBarrel(barrel, req, res, checkState) {

    barrel.save((error) => {
        if (error) {
            return res.negotiate(error);
        }

        // log the new barrel state
        BarrelLog.pushToHistory(barrel, (error, barrelHistory) => {
            if (error) {
                return res.negotiate(error);
            }

            if (checkState) {
                checkTeamStocks(barrel);
            }

            return res.ok(barrel);

        });
    });
}

module.exports = BarrelController;
