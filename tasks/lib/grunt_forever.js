/*
  TODO
 */

'use strict';

// External libs.
var forever = require('forever'),
    foreverMonitor = require('forever-monitor');

exports.init = function() {
  var exports = {};

  exports.start = function(options, callback) {
    callback = callback || function () {};
    options = options || {};
    var config = options.config || {};
    var appFile = options.appFile;
    var daemonize = options.daemonize;
    if (daemonize) {
      forever.startDaemon(appFile, config);
      return callback();
    }
    var child = new (foreverMonitor).Monitor(appFile, config);
    child.on('exit', function () {
      console.log(appFile, ' with config: ', config, ' -- has exited');
    });
    child.start();
    // block action since we want to run forever in the foreground
  };

  exports.stop = function(options, callback) {
    callback = callback || function () {};
    options = options || {};
    var process = options.process;
    forever.stop(process)
      .on('stop', function() {
        callback();
      })
      .on('error', function (err) {
        callback(err);
      });
  };

  exports.list = function(options, callback) {
    options = options || {};
    callback = callback || function () {};
    var appFile = options.appFile;
    forever.list(false, function(context, list) {
      var procs = [];
      list && list.forEach(function (item) {
        if (appFile && item.file !== appFile) { return; }
        procs.push(item);
      });
      callback(procs);
    });
  };

  return exports;
};
