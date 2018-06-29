var gulp = require('gulp'),
	del = require('del'), //删除文件
	replace = require('gulp-replace-path'), //替换文件内容
	gulpSequence = require('gulp-sequence'),
	ts = require('gulp-typescript'),
	changed = require('gulp-changed'),
	debug = require('gulp-debug'),
	Q = require('q');

var tsProject = ts.createProject('tsconfig.json', {target: 'es2017'});
var tsFrontProject = ts.createProject('tsconfig.json');

let destDir = './bin';

gulp.task('clearBin', function () {
	return del([
		destDir
	]);
});

let templateSrc = 'views/_template/**';
gulp.task('make-template', function () {
	let dest = destDir + '/views/_template_front/';
	return gulp.src(templateSrc)
		.pipe(changed(dest))
		.pipe(replace('<%', '<%%'))
		.pipe(replace('%>', '%%>'))
		.pipe(gulp.dest(dest));
});

gulp.task('ts', function () {
	return gulp.src([
		'app.ts',
		'config.ts',
		'routes/**'
	], {
		base: './'
	})
		.pipe(changed(destDir, {extension: '.js'}))
		.pipe(tsProject())
		.pipe(gulp.dest(destDir));
});

//前端
let tsFrontSrc = ['public/ts/**/*.ts'];
gulp.task('ts-front', function () {
	let dest = destDir + '/public/js';
	return gulp.src(tsFrontSrc)
		.pipe(changed(dest, {extension: '.js'}))
		.pipe(tsFrontProject())
		.pipe(gulp.dest(dest));
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
			'bower_components/seiyria-bootstrap-slider/dist/@(css)/**',
			'bower_components/bootstrap-fileinput/@(css|img)/**',
		])
			.pipe(gulp.dest(destDir + '/public'))
			.on('end', onFinished),

		gulp.src(['bower_components/jquery-ui/themes/base/jquery-ui.min.css',
			'bower_components/smalot-bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',
		])
			.pipe(gulp.dest(destDir + '/public/css'))
			.on('end', onFinished),

		gulp.src([
			'bower_components/requirejs/require.js',
			'bower_components/require-css/css.min.js',
			'bower_components/bootstrap/dist/js/bootstrap.min.js',
			'bower_components/bootstrap-fileinput/js/fileinput.min.js',
			'bower_components/smalot-bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',
			'bower_components/seiyria-bootstrap-slider/dist/bootstrap-slider.min.js',
			'bower_components/jquery-ui/jquery-ui.min.js',
			'bower_components/jquery/dist/jquery.min.js',
			'bower_components/jquery.cookie/jquery.cookie.js',
			'bower_components/SparkMD5/spark-md5.min.js',

			'node_modules/q/q.js',
			'node_modules/ejs/ejs.min.js',
		])
			.pipe(gulp.dest(destDir + '/public/js/libs'))
			.on('end', onFinished),

		gulp.src([
			'node_modules/socket.io-client/dist/**',
		])
			.pipe(gulp.dest(destDir + '/public/js/libs/socket.io'))
			.on('end', onFinished)
	]);
	return defer.promise;
});

let copySrc = ['public/!(ts)/**', 'views/**'];
gulp.task('copy', function () {
	return gulp.src(copySrc, {
		base: './',
		noDir: true,
	}).pipe(changed(destDir))
		.pipe(gulp.dest(destDir));
});

gulp.task('watch', function () {
	gulp.watch(copySrc, ['copy']);
	//gulp.watch(tsFrontSrc, ['ts-front']);
	gulp.watch(templateSrc, ['make-template']);
	//gulp.watch(["**/*.ts", "!**/node_modules/**"], ['ts']);
});


gulp.task('front', gulpSequence('ts-front', 'copy'));

gulp.task('make', ['make-template']);

gulp.task('clear', ['clearBin']);

gulp.task('dev', gulpSequence(['make', 'copyDep'], ['front', 'ts']));

gulp.task('default', gulpSequence('clear', 'dev'));