/*
 * This file is made to be executed from commandline : `node cli/fixtures.js`
 *
 * This file will load fixtures into your database.
 *
 * See https://github.com/ungdev/flux2-server/wiki/Fixtures for more informations
 */

const Sails = require('sails');
const fs = require('fs');
const inquirer = require('inquirer');

Sails.lift({port: 1338}, (error) => {
    sails.config.firebase = {};
    sails.log.info();
    sails.log.info();
    sails.log.info('=========== Create team ===========');
    sails.log.info('This command will help you to create a team from the commandline.' +
        'The server have to be stopped before this command starts.');

    inquirer.prompt([
    {
        message: 'Display name of the team',
        default: 'Flux admins',
        name: 'name',
    },
    {
        message: 'Group of the team',
        default: 'orga',
        name: 'group',
    },
    {
        message: 'Locaton of the headquarter of the team',
        default: 'Salle Asso',
        name: 'location',
    },
    {
        type: 'list',
        message: 'Role of the team',
        name: 'role',
        choices: Object.keys(sails.config.roles),
        default: 'admin'
    }]).then((answers) => {
        Team.create(answers, (error, team) => {
            if(error) {
                sails.log.error(error);
            }
            sails.log.info('Created team:', team);
            sails.lower();
        });
    });
});
