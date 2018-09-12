var gulp = require('gulp'),
	del = require('del'), //删除文件
	replace = require('gulp-replace-path'), //替换文件内容
	gulpSequence = require('gulp-sequence'),
	ts = require('gulp-typescript'),
	changed = require('gulp-changed'),
	debug = require('gulp-debug'),
    Q = require('q'),    
    sourcemaps = require('gulp-sourcemaps'),    
    path = require('path');

var tsProject = ts.createProject('tsconfig.json', {target: 'es2017', module: 'commonjs'});
var tsFrontProject = ts.createProject('tsconfig.json', {target: 'es5', module: 'umd'});

let destDir = tsProject.config.compilerOptions.outDir || './dest';
let srcDir = tsProject.config.compilerOptions.rootDir || './src';

function getDest(dest){
	return path.join(destDir, dest);
}

function getSrc(src){	
	if(!Array.isArray(src))
		src = [src];
	src = src.map(ele => {
		return path.join(srcDir, ele);
	});
	return src;
}

gulp.task('clearDest', function () {
	return del([
		destDir
	]);
});

let templateSrc = getSrc('views/_template/**');
gulp.task('make-template', function () {
	let dest = getDest('/views/_template_front/');
	return gulp.src(templateSrc)
		.pipe(changed(dest))
		.pipe(replace('<%', '<%%'))
		.pipe(replace('%>', '%%>'))
		.pipe(gulp.dest(dest));
});

let tsSrc = getSrc([
    'app.ts',
    'config.ts',
    'routes/**'
]);
gulp.task('ts', function () {
	return gulp.src(tsSrc, {
		base: srcDir
	})
		//.pipe(changed(destDir, {extension: '.js'}))
		.pipe(tsProject())
		.pipe(gulp.dest(destDir));
});

//前端
let tsFrontSrc = getSrc(['public/ts/**/*.ts']);
gulp.task('ts-front', function () {
	let dest = getDest('/public/js');
    return gulp.src(tsFrontSrc)
		//.pipe(changed(dest, {extension: '.js'}))
	    //.pipe(sourcemaps.init())
        .pipe(tsFrontProject())        
        //.pipe(sourcemaps.write('.'))
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
			.pipe(gulp.dest(getDest('/public')))
			.on('end', onFinished),

		gulp.src(['bower_components/jquery-ui/themes/base/jquery-ui.min.css',
			'bower_components/smalot-bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',
			'bower_components/jquery.liMarquee/css/liMarquee.css',
		])
			.pipe(gulp.dest(getDest('/public/css')))
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
			'bower_components/jquery.liMarquee/js/jquery.liMarquee.js',

			'node_modules/q/q.js',
			'node_modules/ejs/ejs.min.js',
            'node_modules/echarts/dist/echarts.common.min.js',
            'node_modules/moment/min/moment.min.js'
		])
			.pipe(gulp.dest(getDest('/public/js/libs')))
			.on('end', onFinished),

		gulp.src([
			'node_modules/socket.io-client/dist/**',
		])
			.pipe(gulp.dest(getDest('/public/js/libs/socket.io')))
			.on('end', onFinished)
	]);
	return defer.promise;
});

let copySrc = getSrc(['public/!(ts)/**', 'views/**']);
gulp.task('copy', function () {
	return gulp.src(copySrc, {
		base: srcDir,
		noDir: true,
	}).pipe(changed(destDir))
		.pipe(gulp.dest(destDir));
});

gulp.task('watch', function () {
	gulp.watch(copySrc, ['copy']);
	//gulp.watch(tsFrontSrc, ['ts-front']);
	gulp.watch(templateSrc, ['make-template']);
	//gulp.watch(tsSrc, ['ts']);
});


gulp.task('front', gulpSequence('ts-front', 'copy'));

gulp.task('make', ['make-template']);

gulp.task('clear', ['clearDest']);

gulp.task('dev', gulpSequence(['make', 'copyDep'], ['front', 'ts']));

gulp.task('default', gulpSequence('clear', 'dev'));