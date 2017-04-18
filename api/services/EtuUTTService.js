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
        accessToken: (user && user.accessToken ? user.accessToken : null),
        refreshToken: (user && user.refreshToken ? user.refreshToken : null),
        tokenExpiration: (user && user.tokenExpiration ? user.tokenExpiration : null),
        tokenRefreshCallback: (accessToken, refreshToken, tokenExpiration) => {
            if(user) {
                user.accessToken = accessToken;
                user.refreshToken = refreshToken;
                user.tokenExpiration = tokenExpiration;
                user.save((error) => {
                    if (error) {
                        sails.log.warn('Error while trying to save new etuutt token to user:', user, error)
                    }
                });
            }
        },
    });
}
