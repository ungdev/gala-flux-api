/**
 * AlertButtonController
 *
 * @description :: Server-side logic for managing Alertbuttons
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    find: (req, res) => {

        // Check permissions
        if (!(Team.can(req, 'alertButton/read') || (Team.can(req, 'alertButton/admin')))) {
            return res.error(403, 'forbidden', 'You are not authorized to read the Alert buttons.');
        }

        // Find allowed AlterButtons
        AlertButton.find()
            .exec((error, alertsButtons) => {
                if (error) {
                    return res.negotiate(error);
                }

                AlertButton.subscribe(req, _.pluck(alertsButtons, 'id'));
                AlertButton.watch(req);

                return res.ok(alertsButtons);
            });

    },

    create: (req, res) => {

        // Check permissions
        if (!Team.can(req, 'alertButton/admin')) {
            return res.error(403, 'forbidden', 'You are not authorized to create an Alert button.');
        }

        // Check parameters
        let missingParameters = [];
        if (!req.param('receiver')) {
            missingParameters.push('receiver');
        }
        if (!req.param('title')) {
            missingParameters.push('title');
        }
        if (!req.param('message')) {
            missingParameters.push('message');
        }
        if (missingParameters.length) {
            console.log(missingParameters.join(', '));
            return res.error(400, 'BadRequest', 'Unknown parameters : ' + missingParameters.join(', '));
        }

        Team.findOne({name: req.param('receiver')}).exec((error, team) => {
            if (error) {
                return res.negotiate(error);
            }

            // Create the AlertButton
            AlertButton.create({
                receiver: team,
                title: req.param('title'),
                message: req.param('message'),
                messagePlaceholder: req.param('messagePlaceholder') ? req.param('messagePlaceholder') : null
            }).exec((error, alertButton) => {
                if (error) {
                    return res.negotiate(error);
                }

                AlertButton.publishCreate(alertButton);
                AlertButton.subscribe(req, [alertButton.id]);

                return res.ok(alertButton);
            });

        });

    },

    update: (req, res) => {

        // Check permissions
        if (!Team.can(req, 'alertButton/admin')) {
            return res.error(403, 'forbidden', 'You are not authorized to update an Alert button.');
        }

        // Find AlertButton
        AlertButton.findOne({id: req.param('id')})
            .exec((error, alertButton) => {
                if (error) {
                    return res.negotiate(error);
                }
                if(!alertButton) {
                    return res.error(404, 'notfound', 'The requested alert button cannot be found');
                }

                // Update
                alertButton.receiver = req.param('receiver', alertButton.receiver);
                alertButton.title = req.param('title', alertButton.title);
                alertButton.message = req.param('message', alertButton.message);
                alertButton.messagePlaceholder = req.param('messagePlaceholder', alertButton.messagePlaceholder);

                alertButton.save((error) => {
                    if (error) {
                        return res.negotiate(error);
                    }

                    AlertButton.publishUpdate(alertButton.id, alertButton);
                    AlertButton.subscribe(req, [alertButton.id]);

                    return res.ok(alertButton);
                });

            });

    }

    // create alert

};


