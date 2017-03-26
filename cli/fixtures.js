/*
 * This file is made to be executed from commandline : `node cli/fixtures.js`
 *
 * This file will load fixtures into your database.
 *
 * See https://github.com/ungdev/flux2-server/wiki/Fixtures for more informations
 */

const Sails = require('sails');
const fs = require('fs');

Sails.lift({}, (error) => {
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
        if(!fixtures) {
            sails.log.warn('Model ' + model + ' doesn\'t have any fixtures.')
            cb();
        }
        else if(typeof fixtures !== 'object') {
            sails.log.error('Model ' + model + ' as a `fixtures` attributes but is not an object.')
            cb();
        }
        else {
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
});
