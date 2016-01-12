const gulp        = require('gulp');
const handlebars  = require('gulp-handlebars');
const wrap        = require('gulp-wrap');
const declare     = require('gulp-declare');
const concat      = require('gulp-concat');
const less        = require('gulp-less');
const path        = require('path');
const minifyCss   = require('gulp-minify-css');
const connect     = require('gulp-connect');
const watch       = require('gulp-watch');
const del         = require('del');
const merge       = require('merge-stream');
const babel       = require('gulp-babel');

gulp.task('templates', () => {
    var templates = gulp.src('./src/templates/*.hbs')
        .pipe(handlebars())
        .pipe(wrap('Handlebars.template(<%= contents %>)'))
        .pipe(declare({
            namespace: 'Handlebars.templates'
        }))
        .pipe(concat('templates.js'));

    var js = gulp.src(['./src/js/app/**/*.es6', './src/js/App.es6'])
        .pipe(babel({
            presets: ['es2015']
        }));

    return merge(js, templates)
        .pipe(concat('app.js'))
        .pipe(gulp.dest('./build/dist/js/'));
});

gulp.task('less', () => {
    var lessStream = gulp.src('./src/css/**/*.less')
        .pipe(less());

    var cssStream = gulp.src('./src/css/**/*.css');

    return merge(lessStream, cssStream)
        .pipe(minifyCss({keepBreaks:true}))
        .pipe(concat('app.css'))
        .pipe(gulp.dest('./build/dist/css/'));
});

gulp.task('watch', () => {
    gulp.watch(['./src/**/*', 'gulpfile.js'], ['build']);
});

gulp.task('connect', ['watch'], () => {
    connect.server();
});

gulp.task('clean', () => {
    del.sync(['build']);
});

gulp.task('build', ['templates', 'less']);

gulp.task('default', ['build']);