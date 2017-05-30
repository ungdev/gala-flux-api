/*
 * This file is made to be executed from commandline : `node cli/test.js`
 *
 * This file will try to start the server and stop it to see if bootstrap is throwing error
 */

const fs = require('fs');
const inquirer = require('inquirer');
const faker = require('faker');

// Load Flux object and init DB
const Flux = require('../Flux.js');

// Try to start the server then stop it
Flux.start()
.then(() => {
    Flux.stop();
});
