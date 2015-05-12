var _ = require('underscore');
var colors = require('ansicolors');

module.exports = function (grunt) {
  'use strict';

  var gruntForever = require('./lib/grunt_forever').init(grunt);
  grunt.registerMultiTask('grunt_forever', 'Runs a forever monitor of your node.js server.', function () {
    var options = this.options();
    var action = options.action || 'none';
    var done = this.async();

    var actions = {
      start:function (callback) {
        gruntForever.list(options, function (data) {
          if (data.length) {
            grunt.log.writeln('Stratosphere is already running ' + colors.green('[OK]'));
            data.forEach(function (item) {
              grunt.log.writeln('pid: ' + colors.green(item.pid));
            });
            return callback();
          }
          gruntForever.start(options, function () {
            grunt.log.writeln('Stratosphere started' + colors.green('[OK]'));
            callback();
          });
        });
      },

      stop: function (callback) {
        gruntForever.list(options, function (data) {
          if (!data.length) {
            grunt.log.writeln('Stratosphere is not running ' + colors.green('[OK]'));
            return callback();
          }
          var totalProcs = data.length;
          var completedProcs = 0;
          data.forEach(function (item) {
            (function (process) {
              grunt.log.writeln('Stopping stratosphere process ' + colors.green(process.pid));
              gruntForever.stop({ process: process.uid }, function (err) {
                if (err) {
                  grunt.log.warn('Error stopping process ' + process.pid + ' -' + colors.red(err));
                }
                completedProcs++;
                if (completedProcs === totalProcs) {
                  callback();
                }
              });
            })(item);
          });
        });
      },

      restart: function (callback) {
        actions.stop(function () {
          // When calling actions.start the forever.list is not returning any data and just halting
          gruntForever.start(options, function (data) {
            grunt.log.writeln('Stratosphere started ' + colors.green('[OK]'));
            callback();
          });
        });
      },

      status: function (callback) {
        gruntForever.list(options, function (data) {
          if (data.length) {
            grunt.log.writeln('Stratosphere active processes');
            data.forEach(function (proc) {
              grunt.log.writeln('pid (' + colors.green(proc.pid) + ')');
            });
          } else {
            grunt.log.writeln('Stratosphere has ' + colors.red(0) + ' active processes');
          }
          callback();
        });
      }
    };

    if (_.has(actions, action)) {
      actions[action](function () {
        done();
      });
    } else {
      grunt.fail.warn('Action ' + action + ' not support');
    }
  });
};
