const Flux = require('../../Flux');
const Jwt = require('jsonwebtoken');

/**
 * JwtService - Set of function usefull for checking and generating jwt
 */
class JWTService {

    /**
     * sign - Syncronosly generate a JWT token from an user object
     *
     * @param  {User} user The user object that will be send via JWT
     * @return {string}      The generate JWT
     */
    static sign(user) {
        return Jwt.sign({
            userId: user.id
        },
        Flux.config.jwt.secret,
        { expiresIn: Flux.config.jwt.expiresIn });
    }

    /**
     * verify - Assyncronously verify JWT validity and return associated user
     *
     * @param  {string} jwt The JWT to test
     * @return {Promise}    The promise that will give associated user on success
     */
    static verify(jwt) {

        return new Promise((resolve, reject) => {
            return Jwt.verify(jwt, Flux.config.jwt.secret, (error, decoded) => {
                if(error) {
                    return reject(error);
                }

                // Check if user exist
                Flux.User.findOne({ where: {
                    id: decoded.userId,
                }})
                .then(resolve)
                .catch(reject);
            });
        });
    }
}

module.exports = JWTService;
