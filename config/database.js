module.exports = {

    // Only host and database are required
    host: process.env.FLUX_DB_HOST || 'localhost',
    database: process.env.FLUX_DB_NAME || 'flux',
    user: process.env.FLUX_DB_USER || 'root',
    password: process.env.FLUX_DB_PASSWORD || '',

    // Will log every query into console
    logging: false,

};
