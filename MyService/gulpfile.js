var gulp = require('gulp'),
	del = require('del'), //删除文件
	replace = require('gulp-replace-path'), //替换文件内容
	babel = require("gulp-babel");

gulp.task('clear-template', function() {
	return del([
		'views/_template_web/*'
	]);
});

gulp.task('make-template', function() {
	gulp.src('views/_template/**')
		.pipe(replace('<%', '{%'))
		.pipe(replace('%>', '%}'))
		.pipe(gulp.dest('views/_template_web'));
});

gulp.task('template', ['clear-template', 'make-template']);

gulp.task('clear-web-js', function() {
	return del([
		'public/js/prd/*'
	]);
});

gulp.task('make-web-js', function() {
	gulp.src("public/js/dev/**")
		.pipe(babel({
			presets: ['es2015']
		}))
		.pipe(gulp.dest("public/js/prd/"));
});

gulp.task('web-js', ['clear-web-js', 'make-web-js']);

gulp.task('default', ['template', 'web-js'])