# gulp-jsonminify

Minifies blocks of JSON-like content into valid JSON by removing all whitespace and comments, using [JSON.minify](https://github.com/fkei/JSON.minify).

## Installation

```bash
npm install gulp-jsonminify --save-dev
```

## Usage

```javascript
var jsonminify = require('gulp-jsonminify');

gulp.task('minify', function () {
    return gulp.src(['path/to/files/*.json'])
        .pipe(jsonminify())
        .pipe(gulp.dest('dist'));
});
```

## LICENSE

(MIT License)
