/*
 * This file is made to be executed from commandline : `node cli/fixtures.js`
 *
 * This file will load fixtures into your database.
 *
 * See https://github.com/ungdev/flux2-server/wiki/Fixtures for more information
 */

const Sails = require('sails');
const fs = require('fs');
const inquirer = require('inquirer');

Sails.lift({port: 1338}, (error) => {

    sails.log.info();
    sails.log.info();
    sails.log.info('=========== Fixture generation ===========');
    sails.log.info('This command will generate fixtures in your database. ' +
        'It\'s recommended to clear the database before starting this command. ' +
        'The server has to be stopped before this command starts.');
    inquirer.prompt({
        type: 'confirm',
        message: 'Do you want to continue ?',
        default: false,
        name: 'continue',
    }).then(function (answers) {
        if(answers.continue) {
            if (error) {
                return console.log('Error: Sails server failed to start: ', error);
            }

            let finalResult = {};

            // Generate the list of models
            let models = [];
            sails.log.info('Models found in config/fixtures.js:', sails.config.fixtures.order);
            if(Array.isArray(sails.config.fixtures.order)) {
                models = sails.config.fixtures.order;
            }
            let files = fs.readdirSync(__dirname + '/../api/models');
            files.forEach(file => {
                if(/^[A-z-0-9_]+\.js$/.test(file) && models.indexOf(file.substr(0,file.length-3)) === -1) {
                    models.push(file.substr(0,file.length-3));
                }
            });
            sails.log.info('Generated Model list:', models);

            async.eachSeries(models, (model, cb) => {
                sails.log.info();
                sails.log.info();
                sails.log.info('## ' + model);
                finalResult[model] = {
                    success: 0,
                    error: 0,
                };

                // Generate final fixture list for this model
                let fixtures = require('../api/models/' + model).fixtures;
                if (!fixtures) {
                    sails.log.warn('Model ' + model + ' doesn\'t have any fixtures.')
                    cb();
                } else if(typeof fixtures !== 'object') {
                    sails.log.error('Model ' + model + ' as a `fixtures` attributes but is not an object.')
                    cb();
                } else {
                    async.eachOfSeries(fixtures, (item, key, cb) => {
                        if(typeof item === 'function') {
                            sails.log.debug('Execution of', key);
                            item((error, result) => {
                                if(error || typeof fixtures !== 'object') {
                                    sails.log.error('Error during execution of function ' + key + ':', error);
                                }
                                else {
                                    delete fixtures[key];
                                    Object.assign(fixtures, result);
                                }
                                cb();
                            });
                        }
                        else {
                            cb();
                        }
                    }, () => {
                        // Items creation
                        sails.log.info(Object.keys(fixtures).length, 'element(s) will be created');
                        async.eachOfSeries(fixtures, (item, key, cb) => {
                            global[model].create(item).exec((error, result) => {
                                if(error) {
                                    sails.log.error(key + ':', error.reason);
                                    if(error.invalidAttributes) {
                                        sails.log.debug(key + ' invalid attributes:', error.invalidAttributes);
                                    }
                                    else {
                                        sails.log.debug(key + ' error details:', error);
                                    }
                                    finalResult[model].error++;
                                }
                                else {
                                    finalResult[model].success++;
                                }
                                cb();
                            });

                        }, cb);
                    });
                }
            }, (error) => {
                sails.log.info('')
                sails.log.info('')
                sails.log.info('### Done')
                for (let model in finalResult) {
                    sails.log.info(model + ': ' + finalResult[model].success + ' success, ' + finalResult[model].error + ' error');
                }
                sails.lower();
            });
        } else {
            sails.lower();
        }
    });
});
