var gulp = require('gulp'),
    del = require('del'), //删除文件
    replace = require('gulp-replace-path'), //替换文件内容
    babel = require('gulp-babel'),
    gulpSequence = require('gulp-sequence'),
    watch = require('gulp-watch');

let templateDestDir = 'views/_template_web/';
let templateSrc = 'views/_template/**';
gulp.task('clear-template', function () {
    return del([
        templateDestDir + '*'
    ]);
});

gulp.task('make-template', function () {
    gulp.src(templateSrc)
        .pipe(replace('<%', '{%'))
        .pipe(replace('%>', '%}'))
        .pipe(gulp.dest(templateDestDir));
});

let webJsDestDir = 'public/js/prd/';
let webJsSrc = 'public/js/dev/**';
gulp.task('clear-web-js', function () {
    return del([
        webJsDestDir + '*'
    ]);
});

gulp.task('make-web-js', function () {
    gulp.src(webJsSrc)
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest(webJsDestDir));
});

gulp.task('clear', ['clear-web-js', 'clear-template']);

gulp.task('default', gulpSequence('clear', ['make-template', 'make-web-js']));

gulp.task('watch', function () {
    gulp.watch(templateSrc, ['make-template']);
    gulp.watch(webJsSrc, ['make-web-js']);
});