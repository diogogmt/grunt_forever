'use strict';

var grunt = require('grunt');
var forever = require('./../tasks/lib/forever').init(grunt);
var appFile = process.cwd() + '/test/server.js';
exports.plugin = {
  start: function(test) {
    test.expect(1);

    forever.start({
      appFile: appFile,
      daemonize: true,
      config: {
        errFile: process.cwd() + '/test/forever-err.log',
        max: 500,
        pidFile: process.cwd() + '/test/server.pid',
        watch: false,
        options: [ ]
      }
    }, function () {
      setTimeout(function () {
        forever.list({appFile: appFile}, function (data) {
          test.equal(data.length, 1, 'Forever should be monitoring one server.js process');
          test.done();
        });
      }, 2000);
    });
  },
  stop: function(test) {
    test.expect(3);

    forever.list({appFile: appFile}, function (data) {
      test.equal(data.length, 1, 'Forever should be monitoring one server.js process');
      forever.stop({ process: data[0].uid }, function (err) {
        test.equal(err, null, 'Stopping forever monitored process should not return an error');
        setTimeout(function () {
          forever.list({appFile: appFile}, function (data) {
            test.equal(data.length, 0, 'Forever should not be monitoring any server.js process');
            test.done();
          });
        }, 2000);
      });
    });
  }
};
