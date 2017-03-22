/**
 * `dev`
 *
 * ---------------------------------------------------------------
 *
 * This Grunt tasklist will run a sail dev server and will restart it on
 * project modification.
 *
 */
module.exports = function(grunt) {
    grunt.registerTask('dev', [
        'run:app',
        'watch:dev'
    ]);
};
