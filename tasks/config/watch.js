/**
 * `watch`
 *
 * ---------------------------------------------------------------
 *
 * Run predefined tasks whenever watched file patterns are added, changed or deleted.
 *
 * Watch for changes on:
 * - files in the `assets` folder
 * - the `tasks/pipeline.js` file
 * and re-run the appropriate tasks.
 *
 * Watch for changes on project modification to
 * - Restart sail dev server
 * - Rebuild documentation
 *
 * For usage docs see:
 *   https://github.com/gruntjs/grunt-contrib-watch
 *
 */
module.exports = function(grunt) {

  grunt.config.set('watch', {
    assets: {

        // Assets to watch:
        files: ['assets/**/*', 'tasks/pipeline.js', '!**/node_modules/**', '!assets/uploads/**'],

        // When assets are changed:
        tasks: ['syncAssets' , 'linkAssets' ]
    },
    dev: {
        files: ['api/**/*', 'assets/**/*', 'config/**/*', '!assets/uploads/**'],
        tasks: ['stop:app', 'run:app' ],
        options: {
            spawn: false,
        },
    },
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
};
