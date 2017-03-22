const EtuUTT = require('../../lib/EtuUTT.js');

/**
 * EtuUTTService - Will initiate the EtuUTT lib with given user token and configuration
 * @param {Object} user Optionnal User object
 *
 * @return {Object}  EtuUTT lib Object
 */
module.exports = function(user) {
    return new EtuUTT({
        baseUri: sails.config.etuutt.baseUri,
        id: sails.config.etuutt.id,
        secret: sails.config.etuutt.secret,
        scopes: sails.config.etuutt.scopes,
        token: (user && user.token ? user.token : null),
    });
}
