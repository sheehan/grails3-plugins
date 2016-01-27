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
const jsonminify  = require('gulp-jsonminify');

gulp.task('templates', () => {
    var partials = gulp.src(['./src/templates/_*.hbs'])
        .pipe(handlebars({
            handlebars: require('handlebars')
        }))
        .pipe(wrap('Handlebars.registerPartial(<%= processPartialName(file.relative) %>, Handlebars.template(<%= contents %>));', {}, {
            imports: {
                processPartialName: function(fileName) {
                    return JSON.stringify(path.basename(fileName, '.js').substr(1));
                }
            }
        }));

    var templates = gulp.src('./src/templates/**/[^_]*.hbs')
        .pipe(handlebars({
            handlebars: require('handlebars')
        }))
        .pipe(wrap('Handlebars.template(<%= contents %>)'))
        .pipe(declare({
            namespace: 'Handlebars.templates'
        }));

    var js = gulp.src([
            './src/js/init.es6',
            './src/js/app/**/*.es6'
        ])
        .pipe(babel({
            presets: ['es2015']
        }));


    return merge(js, partials, templates)
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

gulp.task('minifyJson', function () {
    return gulp.src(['data/*.json'])
        .pipe(jsonminify())
        .pipe(gulp.dest('./build/dist/data/'));
    });

gulp.task('watch', () => {
    gulp.watch(['./src/**/*', 'gulpfile.js', './data/*.json'], ['build']);
});

gulp.task('connect', ['clean', 'build', 'watch'], () => {
    connect.server();
});

gulp.task('clean', () => {
    del.sync(['build']);
});

gulp.task('build', ['templates', 'less', 'minifyJson']);

gulp.task('default', ['build']);
