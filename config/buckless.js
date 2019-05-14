/**
 * Buckless API settings
 */

module.exports.etuutt = {
    baseUri: process.env.BUCKLESS_BASEURI || 'https://etu.utt.fr/api',
    mail: process.env.BUCKLESS_MAIL || null,
    password: process.env.BUCKLESS_PASSWORD || null
}
