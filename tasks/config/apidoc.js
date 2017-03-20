/**
 * `apidoc`
 *
 * ---------------------------------------------------------------
 *
 * Generate api documentation
 */
module.exports = function(grunt) {
    grunt.config.set('apidoc', {
        flux: {
            src: "api/controllers/",
            dest: "apidoc/"
        }
    });

    grunt.loadNpmTasks('grunt-apidoc');
};
