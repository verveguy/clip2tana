var through = require('through2');
var PluginError = require('plugin-error');
var jsonminify = require('jsonminify');

module.exports = function () {
    'use strict';

    return through.obj(function (file, encoding, callback) {
        if (file.isNull()) {
            this.push(file);
            return callback();
        }

        if (file.isStream()) {
            this.emit('error', new PluginError('gulp-jsonminify', 'Streaming not supported'));
            return callback();
        }

        try {
            file.contents = new Buffer(jsonminify(file.contents.toString()).toString());
        } catch (err) {
            this.emit('error', new PluginError('gulp-jsonminify', err));
        }

        this.push(file);
        callback();
    });
};