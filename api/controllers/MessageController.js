/**
 * MessageController
 *
 * @description :: Server-side logic for managing Messages
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    /**
     * `UserController.createTest()`
     *  First API method for the simple chat, an example of pubsub with front-end
     */
    createTest: function (req, res) {
        Message.create({text: req.param('text')}).exec(function (err, message){
            if (err) { return res.serverError(err); }
            sails.log('message created', message);
            Message.publishCreate(message);
            return res.ok(message);
        });
    },
};
