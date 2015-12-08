'use strict';

var gulp = require('gulp'),
    sass = require('gulp-sass'),
    maps = require('gulp-sourcemaps');


// Compiles all Sass file into CSS (doesn't minify)
gulp.task("compileSass", function() {
    return gulp.src('scss/app.scss')
        .pipe(maps.init())
        .pipe(sass({ includePaths: ['./bower_components/foundation/scss'] }))
        .pipe(maps.write("./"))
        .pipe(gulp.dest('public/css'));
});

gulp.task('watch', function() {
    gulp.watch("scss/**/*.scss", ['compileSass']);
});

gulp.task('default', ['compileSass']);