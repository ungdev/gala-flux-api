/**
 * EtuUTT OAuth and API settings
 */

module.exports.etuutt = {
    id: process.env.ETUUTT_ID || '23114291575',
    secret: process.env.ETUUTT_SECRET || '67611ff64f9aee90a3f0b1c0953f22a7',
    baseUri: process.env.ETUUTT_BASEURI || 'https://etu.utt.fr/api',
    scopes: process.env.ETUUTT_SCOPES || 'public',
}
