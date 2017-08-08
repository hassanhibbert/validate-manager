var gulp = require('gulp');
var uglify = require('gulp-uglify');
var pump = require('pump');
var babel = require('gulp-babel');
var rename = require('gulp-rename');

gulp.task('compress', function (cb) {
    pump([
            gulp.src('validate.manager.js'),
            babel({
                presets: ['es2015']
            }),
            rename('validate.manager.min.js'),
            uglify(),
            gulp.dest('dist'),
            gulp.dest('demo/js')
        ],
        cb
    );
});

gulp.task('watch', function () {
  gulp.watch(['validate.manager.js'], ['compress']);
});

