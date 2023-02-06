var eventStream = require('event-stream');

module.exports = gulpChange;

function gulpChange(run) {
    return eventStream.map(function(file, done) {
        if (file.isNull()) {
        	return done(null, file);
        }
        if (file.isStream()) {
        	return done(new PluginError('gulp-change', 'Streaming not supported.'));
        }
        var content = file.contents.toString();
        var ctx = {
        	file: file,
        	fname: file.history[file.history.length - 1].substr(file.base.length),
        	originalContent: content
        };
        
        function next(err, content) {
        	if (err) {
        		return done(err);
        	}
        	if (content) {
        		file.contents = new Buffer(content);
        	}
        	done(null, file);
        }

        if (run.length > 1) {
        	run.call(ctx, content, next);
        } else {
        	next(null, run.call(ctx, content))
        }
    });
}