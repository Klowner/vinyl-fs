'use strict';

var through2 = require('through2');
var fs = require('graceful-fs');
var path = require('path');

function resolveSymlinks(followSymlinks) {
  return followSymlinks ?
    through2.obj(resolveFile) :
    through2.obj(resolveFileKeepSymlinks);
}

// a stat property is exposed on file objects as a (wanted) side effect
function resolveFile(globFile, enc, cb) {
  fs.lstat(globFile.path, function (err, stat) {
    if (err) {
      return cb(err);
    }

    globFile.stat = stat;

    if (!stat.isSymbolicLink()) {
      return cb(null, globFile);
    }

    fs.realpath(globFile.path, function (err, filePath) {
      if (err) {
        return cb(err);
      }

      globFile.base = path.dirname(filePath);
      globFile.path = filePath;

      // recurse to get real file stat
      resolveFile(globFile, enc, cb);
    });
  });
}

// nearly identical to resolveFile except this function doesn't
// omit symbolic links nor does it recursively resolve them
function resolveFileKeepSymlinks(globFile, enc, cb) {
  fs.lstat(globFile.path, function (err, stat) {
    if (err) {
      return cb(err);
    }

    globFile.stat = stat;

    return cb(null, globFile);
  });
}


module.exports = resolveSymlinks;
