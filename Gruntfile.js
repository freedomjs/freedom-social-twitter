/**
 * Gruntfile for freedom-social-twitter
 **/

var path = require('path');

module.exports = function(grunt) {
  grunt.initConfig({
    copy: {
      build: {
        cwd: 'src/',
        src: ['**'],
        dest: 'build/',
        flatten: false,
        filter: 'isFile',
        expand: true
      },
      freedom: {
        src: [ require.resolve('freedom') ],
        dest: 'build/',
        flatten: true,
        filter: 'isFile',
        expand: true,
        onlyIf: 'modified'
      }
    },

    browserify: {
      twitter: {
        files: {
          'build/twitter.js': [ require.resolve('simple-twitter') ]
        },
        options: {
          browserifyOptions: {
            standalone: 'Twitter'
          }
        }
      }
    },

    jshint: {
      all: ['src/**/*.js', 'spec/**/*.js'],
      options: {
        jshintrc: true
      }
    },

    connect: {
      demo: {
        options: {
          port: 8000,
          keepalive: true,
          base: ['./', 'build/'],
          open: 'http://localhost:8000/build/demo/main.html'
        }
      }
    },

    clean: ['build/']
  });

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('build', [
    'jshint',
    'copy',
    'browserify'
  ]);
  grunt.registerTask('demo', [
    'build',
    'connect'
  ]);
  grunt.registerTask('default', [
    'build'
  ]);

}
