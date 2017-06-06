/*
 * This file is made to be executed from commandline : `node cli/fixtures.js`
 *
 * This file will load fixtures into your database.
 *
 * A part of thoses fixtures is from Gala 2017, a part is randomly generated
 */

const fs = require('fs');
const inquirer = require('inquirer');
const faker = require('faker');

// Load Flux object and init DB
const Flux = require('../Flux.js');

// vars
let teams = [];
let users = [];
let barrels = [];

const options = {
    hooks: false,
    individualHooks: false,
};

Flux.startCLI().then(() => {
    Flux.log.info();
    Flux.log.info();
    Flux.log.info('=========== Fixture generation ===========');
    Flux.log.info('This command will generate fixtures in your database. ');
    Flux.log.info();
    Flux.log.warn('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
    Flux.log.warn('!!!!! DATABASE WILL BE CLEARED !!!!!')
    Flux.log.warn('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
    Flux.log.info();
    inquirer.prompt({
        type: 'confirm',
        message: 'Do you want to continue ?',
        default: false,
        name: 'continue',
    }).then(function (answers) {
        if(!answers.continue) {
            return Promise.reject();
        }

        // Clear db
        return Flux.sequelize.sync({ force : true });
    })
    .then(() => {
        Flux.log.info('DB cleared');

        // Create teams (Gala 2017)
        return Flux.Team.bulkCreate([
            { name: 'Informatique', group: '', location: '', role: 'Développeur' },
            { name: 'Logistique', group: '', location: 'Foyer', role: 'Logistique' },
            { name: 'SecUTT', group: '', location: 'Snack', role: 'Receuveur d\'alerte' },
            { name: 'Tréso', group: '', location: '', role: 'Coord' },
            { name: 'Coord', group: '', location: '', role: 'Coord' },
            { name: 'Bar PMOM', group: 'Bar', location: 'B101', role: 'Bar' },
            { name: 'Bar RUTT', group: 'Bar', location: 'C104', role: 'Bar' },
            { name: 'Bar EPF', group: 'Bar', location: 'B105', role: 'Bar' },
            { name: 'Bar Asanutt/Campus3', group: 'Bar', location: 'B106', role: 'Bar' },
            { name: 'Bar Falutt', group: 'Bar', location: 'C102', role: 'Bar' },
            { name: 'Bar ATECAP', group: 'Bar', location: 'C105', role: 'Bar' },
            { name: 'Bar Revivre', group: 'Bar', location: 'Couloir A0', role: 'Bar' },
            { name: 'Bar MAC2', group: 'Bar', location: 'M104', role: 'Bar' },
            { name: 'Bar UNG', group: 'Bar', location: 'Hall M', role: 'Bar' },
            { name: 'Bar BDE/ISM', group: 'Bar', location: 'Amphi Ext', role: 'Bar' },
            { name: 'Bar DEFI', group: 'Bar', location: 'Chapiteau', role: 'Bar' },
            { name: 'PDV Etu', group: 'PDV', location: 'Hall Etu', role: 'Espace orga' },
            { name: 'PDV Entrée', group: 'PDV', location: 'Entrée', role: 'Espace orga' },
            { name: 'PDV Accueil', group: 'PDV', location: 'Accueil UTT', role: 'Espace orga' },
            { name: 'Vestiaire', group: '', location: 'Cafet', role: 'Espace orga' },
            { name: 'Entrée', group: '', location: 'Entre H et M', role: 'Espace orga' },
            { name: 'Son & Lumière', group: '', location: '', role: 'Orga' },
            { name: 'Orgas', group: '', location: '', role: 'Orga' },
        ], options);
    })
    .then((data) => {
        Flux.log.info('Teams created:', data.length);
        teams = data;

        // Create fixed users for dev
        return Flux.User.bulkCreate([
            { login: 'labateau', ip: null, name: 'Aurelien LABATE', teamId: 1 },
            { login: 'prudhom1', ip: null, name: 'Antoine PRUDHOMME', teamId: 1 },
            { login: '', ip: '127.0.0.1', name: 'PC Localhost', teamId: 1 },
        ], options);
    })
    .then((data) => {
        Flux.log.info('Dev users created:', data.length);

        users = data;

        let bulkData = [];

        // create 5-15 users in each team
        let j = 0;
        for (let team of teams) {
            let max = faker.random.number({min:5, max:15});
            for (let i = 0; i < max; i++) {
                if(faker.random.boolean()) {
                    // IP user
                    bulkData.push({ login: null, ip: '100.0.'+j+'.'+i, name: faker.name.findName(), teamId: team.id });
                }
                else {
                    // EtuUTT user
                    let name = faker.name.findName();
                    let login = name.replace(/[^A-z]/g, '').toLowerCase().substr(0,8) + j + i;
                    bulkData.push({ login: login, ip: null, name: name, teamId: team.id });
                }
            }
            j++;
        }

        // Get team list
        return Flux.User.bulkCreate(bulkData, options);
    })
    .then((data) => {
        users = users.concat(data);
        Flux.log.info('Random users created:', data.length);


        let bulkData = [];

        // Public channels
        let channels = new Set(['public:General']);
        for (let team of teams) {
            channels.add('public:'+team.name);
        }
        channels = [...channels];

        // create 5 messages per users in random public channels
        for (let user of users) {
            for (let i = 0; i < 2; i++) {
                bulkData.push({ text: faker.hacker.phrase(), channel: faker.random.arrayElement(channels), userId: user.id, createdAt: faker.date.recent()});
            }

        }

        // Get team list
        return Flux.Message.bulkCreate(bulkData, options);
    })
    .then((data) => {

        Flux.log.info('Random message sent:', data.length);

        // Create barrelTypes
        return Flux.BarrelType.bulkCreate([
            { name: 'Comète Pils', shortName: 'COM', supplierPrice: 53.46, sellPrice: 210, liters: 30 },
            { name: 'Queue de Charrue', shortName: 'CHA', supplierPrice: 90.46, sellPrice: 240, liters: 20 },
            { name: 'Cidre Raison brut', shortName: 'CID', supplierPrice: 79.67, sellPrice: 180, liters: 30 },
            { name: 'Floris kriek', shortName: 'KRI', supplierPrice: 112.8, sellPrice: 240, liters: 30 },
            { name: 'Barbar Bok', shortName: 'BAR', supplierPrice: 65.88, sellPrice: 180, liters: 15 },
            { name: 'La Chouffe', shortName: 'CHF', supplierPrice: 86.23, sellPrice: 240, liters: 20 },
            { name: 'Cuvée des Trolls', shortName: 'TRO', supplierPrice: 120.92, sellPrice: 360, liters: 30 },
            { name: 'St Feuillien', shortName: 'FEU', supplierPrice: 87.82, sellPrice: 240, liters: 20 },
            { name: 'Choue', shortName: 'CHO', supplierPrice: 0, sellPrice: 0, liters: 30 },
        ], options);
    })
    .then((data) => {
        Flux.log.info('BarrelType created:', data.length);

        // set barrel counts
        return Promise.all([
            data[0].setCount(30),
            data[1].setCount(9),
            data[2].setCount(8),
            data[3].setCount(8),
            data[4].setCount(15),
            data[5].setCount(20),
            data[6].setCount(8),
            data[7].setCount(5),
            data[8].setCount(8),
        ]);
    })
    .then(() => {
        Flux.log.info('Barrels created');

        // Find barrels
        return Flux.Barrel.findAll();
    })
    .then((data) => {
        Flux.log.info('Barrel found:', data.length);
        barrels = data;

        // Take only team that can receive barrels
        barrelTeams = teams.filter(team => {
            return team.can('ui/stockReceiver');
        });


        // Update randomly 50 barrels
        let promises = [];
        for (var i = 0; i < 80; i++) {
            let barrel = faker.random.arrayElement(barrels);
            barrel.state = faker.random.arrayElement(['new', 'opened', 'empty']);
            barrel.teamId = faker.random.arrayElement(barrelTeams).id;
            promises.push(barrel.save());
        }

        return Promise.all(promises);
    })
    .then((data) => {
        Flux.log.info('Barrel updated:', data.length);

        // Create bottletypes
        return Flux.BottleType.bulkCreate([
            { name: 'Champagne', shortName: 'CHP', supplierPrice: 11.35, sellPrice: 21, quantityPerBox: 6, originalStock: 1464 },
            { name: 'Vin blanc', shortName: 'VB', supplierPrice: 10.01, sellPrice: 17, quantityPerBox: 6, originalStock: 42 },
            { name: 'Vin rosé', shortName: 'VRS', supplierPrice: 6.67, sellPrice: 15, quantityPerBox: 6, originalStock: 42 },
            { name: 'Vin rouge', shortName: 'VRO', supplierPrice: 6.67, sellPrice: 15, quantityPerBox: 6, originalStock: 42 },
        ], options);
    })
    .then((data) => {
        Flux.log.info('BottleType created:', data.length);

        // Create alert buttons
        return Flux.AlertButton.bulkCreate([
            { title: 'Demande de délestage', category: 'Argent', senderGroup: 'PDV', messageRequired: false, messagePrompt: null, messageDefault: null, receiverTeamId: 4 },
            { title: 'Autre', category: 'Autre', senderGroup: null, messageRequired: true, messagePrompt: null, messageDefault: null, receiverTeamId: 2 },
            { title: 'Problème Cashless', category: 'Cashless', senderGroup: null, messageRequired: false, messagePrompt: null, messageDefault: null, receiverTeamId: 2 },
            { title: 'Cashless : Bracelet cassé', category: 'Cashless', senderGroup: null, messageRequired: false, messagePrompt: null, messageDefault: null, receiverTeamId: 2 },
            { title: 'Gobelets pour softs', category: 'Manques', senderGroup: 'Bar', messageRequired: false, messagePrompt: null, messageDefault: null, receiverTeamId: 2 },
            { title: 'Gobelets pour bières', category: 'Manques', senderGroup: 'Bar', messageRequired: false, messagePrompt: null, messageDefault: null, receiverTeamId: 2 },
            { title: 'Ingrédients coktail', category: 'Manques', senderGroup: 'Bar', messageRequired: true, messagePrompt: 'Quels ingrédients manquent ?', messageDefault: null, receiverTeamId: 2 },
            { title: 'Sacs poubelles', category: 'Manques', senderGroup: null, messageRequired: false, messagePrompt: null, messageDefault: null, receiverTeamId: 2 },
            { title: 'Flûte champagne', category: 'Manques', senderGroup: 'Bar', messageRequired: false, messagePrompt: null, messageDefault: null, receiverTeamId: 2 },
            { title: 'Besoin de secours', category: 'Sécurité', senderGroup: null, messageRequired: true, messagePrompt: null, messageDefault: '-Nombre de victimes: (1 ou >1)\n-La victime peut parler: (Oui/Non)\n-La victime respire: (Oui/Non/Ne sais pas)\n-Situation: (Alcool/Bagarre/Malaise/...)\n-Autre infos:', receiverTeamId: 3 },
            { title: 'Besoin agent de sécurité', category: 'Sécurité', senderGroup: null, messageRequired: true, messagePrompt: 'Quel est le problème ?', messageDefault: null, receiverTeamId: 5 },
            { title: 'Problème au niveau d\'un fût', category: 'Technique', senderGroup: 'PDV', messageRequired: false, messagePrompt: null, messageDefault: null, receiverTeamId: 2 },
            { title: 'Problème au niveau de la tireuse', category: 'Technique', senderGroup: 'PDV', messageRequired: false, messagePrompt: null, messageDefault: null, receiverTeamId: 2 },
            { title: 'Son et lumière', category: 'Technique', senderGroup: 'PDV', messageRequired: false, messagePrompt: null, messageDefault: null, receiverTeamId: 2 },
        ], options);
    })
    .then((data) => {
        Flux.log.info('Alert buttons created:', data.length);

        // Create alerts
        return Flux.Alert.bulkCreate([
            { title: 'Demande de délestage', severity: 'serious', message: '', senderTeamId: 18, receiverTeamId: 4, AlertButtonId: 1 },
            { title: 'Gobelets pour softs', severity: 'warning', message: '', senderTeamId: 8, receiverTeamId: 2, AlertButtonId: 1 },
            { title: 'Problème au niveau de la tireuse', severity: 'serious', message: 'Ça mousse trop !', senderTeamId: 10, receiverTeamId: 2, AlertButtonId: 1 },
        ], options);


    })
    .then((data) => {
        Flux.log.info('Alerts created:', data.length);
        Flux.stop();
    })
    .catch((error) => {
        Flux.log.error(error);
    });
});
