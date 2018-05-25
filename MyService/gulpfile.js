var gulp = require('gulp'),
    del = require('del'), //删除文件
    replace = require('gulp-replace-path'), //替换文件内容
    babel = require('gulp-babel'),
    gulpSequence = require('gulp-sequence'),
    ts = require('gulp-typescript'),
    watch = require('gulp-watch'),
    Q = require('q');

var tsProject = ts.createProject('tsconfig.json');
var tsFrontProject = ts.createProject('tsconfig.json');

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
        ], {
            base: './'
        }).pipe(tsProject())
        .pipe(gulp.dest(destDir));
});
//前端
gulp.task('ts-front', function () {
    return gulp.src('public/ts/**/*.ts')
        .pipe(tsFrontProject())
        .pipe(gulp.dest(destDir + '/public/js'));
});

//前端依赖
gulp.task('copyDep', function () {
    var defer = Q.defer();
    let finishedCount = 0;
    let task = [];
    let onFinished = function () {
        if (++finishedCount == task.length) {
            defer.resolve();
        }
    };
    task = task.concat([
        gulp.src(['bower_components/bootstrap/dist/@(css|fonts)/**',
            'bower_components/font-awesome/@(css|fonts)/**'
        ])
        .pipe(gulp.dest(destDir + '/public'))
        .on('end', onFinished),

        gulp.src(['bower_components/bootstrap/dist/js/bootstrap.min.js'])
        .pipe(gulp.dest(destDir + '/public/libs'))
        .on('end', onFinished)
    ]);
    return defer.promise;
});

let copySrc = ['public/!(ts)/**/*', 'views/**/*'];
gulp.task('copy', function () {
    return gulp.src(copySrc, {
            base: './',
            noDir: true,
        })
        .pipe(gulp.dest(destDir));
});

gulp.task('watch', function () {
    gulp.watch(copySrc, ['copy']);
    //gulp.watch(["**/*.ts", "!**/node_modules/**"], ['ts']);
});


gulp.task('front', gulpSequence('ts-front', 'copy'));

gulp.task('make', ['make-template']);

gulp.task('clear', ['clearBin', 'clear-template']);

gulp.task('dev', gulpSequence(['make', 'copyDep'], ['front', 'ts']));

gulp.task('default', gulpSequence('clear', 'dev'));