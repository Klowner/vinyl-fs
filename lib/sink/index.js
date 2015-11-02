'use strict';

var through2 = require('through2');

function sink() {

  function closeStream(file, enc, cb) {
    if (file.isStream()) {
      return file.contents.close(function () {
        file.contents = null;
        cb();
      });
    }

    cb();
  }

  return through2.obj(closeStream);
}

module.exports = sink;
