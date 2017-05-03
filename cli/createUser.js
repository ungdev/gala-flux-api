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
    sails.log.info();
    sails.log.info();
    sails.log.info('=========== Create user ===========');
    sails.log.info('This command will help you to create an user from the commandline.' +
        'The server have to be stopped before this command starts.');


    // get Team list
    Team.find().exec((error, teams) => {
        if(error) {
            sails.log.error(error);
            return sails.lower();
        }
        if(!teams.length) {
            sails.log.error('There is no teams in the database. You have to create a Team first.')
            return sails.lower();
        }

        let teamMap = {}
        for (team of teams) {
            teamMap[team.name] = team.id;
        }

        let answers = null;
        inquirer.prompt([{
            type: 'list',
            message: 'What type of user, do you want to create ?',
            choices : [
                'IP',
                'EtuUTT',
            ],
            default: 'EtuUTT',
            name: 'type',
        },
        {
            message: 'Display name',
            default: 'Administrator',
            name: 'name',
        },
        {
            type: 'list',
            message: 'Team',
            name: 'team',
            choices: Object.keys(teamMap),
            default: 'Flux'
        }]).then((answers) => {
            answers1 = answers;
            if(answers.type === 'EtuUTT') {
                return inquirer.prompt({
                    message: 'Your EtuUTT login',
                    name: 'login',
                    validate: (value) => {
                        return (value != '');
                    }
                });
            }
            else {
                return inquirer.prompt({
                    message: 'Your IP',
                    name: 'ip',
                    validate: (value) => {
                        return /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?).(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(value);
                    }
                });
            }
        })
        .then((answers) => {
            let user = {
                name: answers1.name,
                team: teamMap[answers1.team],
            }
            if(answers.login) {
                user['login'] = answers.login;
            }
            else {
                user['ip'] = answers.ip;
            }

            User.create(user, (error, user) => {
                if(error) {
                    sails.log.error(error);
                }
                sails.log.info('Created user:', user);
                sails.lower();
            })
        });
    });
});
