/**
 * Buckless API settings
 */

module.exports.buckless = {
    baseUri: process.env.BUCKLESS_BASEURI || 'https://api.gala2019.inst.buckless.com/api/v1',
    mail: process.env.BUCKLESS_MAIL || null,
    password: process.env.BUCKLESS_PASSWORD || null
}
