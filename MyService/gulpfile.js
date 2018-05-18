var gulp = require('gulp'),
    del = require('del'), //删除文件
    replace = require('gulp-replace-path'), //替换文件内容
    babel = require('gulp-babel'),
    gulpSequence = require('gulp-sequence'),
    ts = require('gulp-typescript'),
    watch = require('gulp-watch');

var tsProject = ts.createProject('tsconfig.json');

let templateDestDir = 'views/_template_web/';
let templateSrc = 'views/_template/**';
gulp.task('clear-template', function () {
    return del([
        templateDestDir + '*'
    ]);
});

gulp.task('make-template', function () {
    return gulp.src(templateSrc)
        .pipe(replace('<%', '{%'))
        .pipe(replace('%>', '%}'))
        .pipe(gulp.dest(templateDestDir));
});

let destDir = './bin';

gulp.task('clearBin', function () {
    return del([
        destDir
    ]);
});

gulp.task('ts', function () {
    return gulp.src([
        'app.ts',
        'config.ts',
        'routes/**/*'
    ], { base: './' }).pipe(tsProject())
        .pipe(gulp.dest(destDir));
});
//前端
gulp.task('ts-front', function () {
    return gulp.src('public/ts/common.ts')
        .pipe(tsProject())
        .pipe(gulp.dest(destDir + '/public/js'));
});
let webJsDestDir = 'public/js/prd/';
let webJsSrc = 'public/js/dev/**';
gulp.task('clear-web-js', function () {
    return del([
        webJsDestDir + '*'
    ]);
});

gulp.task('make-web-js', function () {
    return gulp.src(webJsSrc)
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest(webJsDestDir));
});

let copySrc = ['public/!(ts)/**/*', 'views/**/*'];
gulp.task('copy', function () {
    return gulp.src(copySrc, { base: './', noDir: true, })
        .pipe(gulp.dest(destDir));
});

gulp.task('watch', function () {
    gulp.watch(copySrc, ['copy']);
    //gulp.watch(["**/*.ts", "!**/node_modules/**"], ['ts']);
});

gulp.task('make', ['make-template', 'make-web-js']);

gulp.task('clear', ['clearBin', 'clear-template', 'clear-web-js']);

gulp.task('dev', gulpSequence('make', 'copy', ['ts']));

gulp.task('default', gulpSequence('clear', 'make', 'copy', ['ts']));