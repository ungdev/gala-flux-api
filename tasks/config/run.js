/**
 * `run`
 *
 * ---------------------------------------------------------------
 *
 * Run bash command
 *
 */
module.exports = function(grunt) {
    grunt.config.set('run', {
        app: {
            options: {
                wait: false,
                ready:  /Server lifted in/,
            },
            args: [
                'app.js',
            ]
        },
    });

    grunt.loadNpmTasks('grunt-run');
};
