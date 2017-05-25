/**
 * EtuUTT OAuth and API settings
 */

module.exports = {
    id: process.env.ETUUTT_ID || null,
    secret: process.env.ETUUTT_SECRET || null,
    baseUri: process.env.ETUUTT_BASEURI || 'https://etu.utt.fr/api',
    scopes: process.env.ETUUTT_SCOPES || 'public',
};
