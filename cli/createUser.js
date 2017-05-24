/*
 * This file is made to be executed from commandline : `node cli/fixtures.js`
 *
 * This file will load fixtures into your database.
 *
 * See https://github.com/ungdev/flux2-server/wiki/Fixtures for more informations
 */


const inquirer = require('inquirer');

// Load Flux object
const Flux = require('../Flux.js');
Flux.initModels();

// Begin console form
Flux.info();
Flux.info();
Flux.info('=========== Create user ===========');
Flux.info('This command will help you to create an user from the commandline.' +
    'The server have to be stopped before this command starts.');


let teamMap = {};

// get Team list
Flux.Team.all()
.then((teams) => {
    if(!teams.length) {
        return Promise.reject('There is no teams in the database. You have to create a Team first.');
    }

    for (let team of teams) {
        teamMap[team.name] = team.id;
    }

    let answers = null;
    return inquirer.prompt([{
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
    }]);
})
.then((answers) => {
    answers1 = answers;
    if(answers.type === 'EtuUTT') {
        return inquirer.prompt({
            message: 'Your EtuUTT login',
            name: 'login',
            validate: (value) => {
                return (value !== '');
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
        teamId: teamMap[answers1.team],
    };

    if(answers.login) {
        user.login = answers.login;
    }
    else {
        user.ip = answers.ip;
    }

    return Flux.User.create(user);
})
.then((user) => {
    Flux.info('Created user:', user.dataValues);
    Flux.sequelize.close();
})
.catch((error) => {
    Flux.sequelize.close();
    Flux.error(error);
});
