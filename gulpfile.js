var gulp = require('gulp');
var useref = require('gulp-useref');
var gulpif = require('gulp-if');
var uglify = require('gulp-uglify');
var clean = require('gulp-clean');
var rename = require('gulp-rename');

gulp.task('build', ['clean'], function () {
  return gulp.src('src/*.html')
    .pipe(useref())
    .pipe(gulpif('*.js', uglify()))
    .pipe(gulp.dest('dist'));
});

gulp.task('scripts', function () {
  return gulp.src('src/js/helperMethods.js')
    .pipe(rename('helperMethods.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('src/js'))
});

gulp.task('move-scripts', ['clean'], function () {
  return gulp.src('src/js/scripts.js')
    .pipe(gulp.dest('dist/js'));
});

gulp.task('clean', function () {
  return gulp.src('dist/')
    .pipe(clean())
});

gulp.task('default', ['build', 'move-scripts']);