var gulp = require('gulp'),
	del = require('del'), //删除文件
	replace = require('gulp-replace-path'); //替换文件内容

gulp.task('clear-all',function(cb){
	del([
		'views/_template_web/*',
	], cb);
})

gulp.task('template', function() {
  gulp.src('views/_template/*')
		.pipe(replace('<%','{%'))
		.pipe(replace('%>','%}'))
		.pipe(gulp.dest('views/_template_web'));
});


gulp.task('default',['clear-all','template'])