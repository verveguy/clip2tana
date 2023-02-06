gulp-change
===========

File content change utility for [GulpJS](http://gulpjs.com/).  

> Allow to easily alter the content of a Gulp files stream with a
> sync/async callback

    npm install gulp-change
    
## Sync Usage
    
    var gulp = require('gulp');
    var change = require('change');
    
    function performChange(content) {
        return content.replace(/foo/g, 'FOO');
    }
    
    gulp.task('change', function() {
        return gulp.src('src/*.html')
            .pipe(change(performChange))
            .pipe(gulp.dest('build/'))
    });

## Async Usage
    
    var gulp = require('gulp');
    var change = require('change');
    
    function performChange(content, done) {
        content.replace(/foo/g, 'FOO');
        done(null, content);
    }
    
    gulp.task('change', function() {
        return gulp.src('src/*.html')
            .pipe(change(performChange))
            .pipe(gulp.dest('build/'))
    });
    
## Callback Context

The callback receive a custom context (`this`) populated with:

### file

original file object from Gulp' stream

### fname

file name

### originalContent

original file content