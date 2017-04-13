const Jwt = require('jsonwebtoken');

/**
 * JwtService - Set of function usefull for checking and generating jwt
 */
module.exports = {


    /**
     * sign - Syncronosly generate a JWT token from an user object
     *
     * @param  {User} user The user object that will be send via JWT
     * @return {string}      The generate JWT
     */
    sign: function(user) {
        return Jwt.sign({
            userId: user.id
        },
        sails.config.jwt.secret,
        { expiresIn: sails.config.jwt.expiresIn });
    },

    /**
     * verify - Assyncronously verify JWT validity and return associated user
     *
     * @param  {string} jwt The JWT to test
     * @return {Promise}    The promise that will give associated user on success
     */
    verify: function(jwt) {
        return new Promise((resolve, reject) => {
            return Jwt.verify(jwt, sails.config.jwt.secret, (error, decoded) => {
                if(error) {
                    return reject(error);
                }

                // Check if user exist
                User.findOne({
                    id: decoded.userId,
                })
                .exec((error, result) => {
                    if(error) {
                        return reject(error);
                    }
                    return resolve(result);
                });
            });
        });
    },
};
