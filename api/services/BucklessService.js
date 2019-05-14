const Buckless = require('../../lib/Buckless');

/**
 * BucklessService - Will initiate the Buckless lib with given user credentials
 * @param {Object} user Optionnal User object
 *
 * @return {Object}  Buckless lib Object
 */
module.exports = function(user) {
    return new Buckless({
        baseUri: sails.config.buckless.baseUri,
        mail: sails.config.buckless.mail,
        password: sails.config.buckess.password
    });
}
