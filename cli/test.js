/*
 * This file is made to be executed from commandline : `node cli/test.js`
 *
 * This file will start the server then stop it to test if it can start
 */

const Sails = require('sails');

Sails.lift({}, (error) => {
    if(error) {
        process.exit(1);
    }
    sails.lower();
});
