/**
 * JSON Web token secret
 */

module.exports.jwt = {
    secret: process.env.JWT_SECRET || 'N0t_S0_s3cr3t_K3y!',
    expiresIn: process.env.JWT_EXPIRES_IN || '365d'
}
