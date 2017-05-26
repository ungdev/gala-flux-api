/*
 * This file is made to be executed from commandline : `node cli/createTeam.js`
 *
 * This file will create a team in your database
 */


const inquirer = require('inquirer');

// Load Flux object
const Flux = require('../Flux.js');
Flux.initModels();

// CLI form
Flux.info();
Flux.info();
Flux.info('=========== Create team ===========');
Flux.info('This command will help you to create a team from the commandline.' +
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
    choices: Object.keys(Flux.config.roles),
    default: 'Admin'
}])
.then((answers) => {
    return Flux.Team.create(answers);
})
.then((team) => {
    Flux.sequelize.close();
    Flux.info('Created team:', team.dataValues);
})
.catch((error) => {
    Flux.sequelize.close();
    Flux.error(error);
});
