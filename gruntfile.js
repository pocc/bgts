/* Via Udemy Intro to Typescript*/
module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-ts');
    
    grunt.initConfig({
        ts: {
            main: {
                src: ['bga/*.ts'],
                dest: 'build/',
            },
            options: {
                rootDir: '.'
            }
        }
    });

    grunt.registerTask('default', ['ts'])
}