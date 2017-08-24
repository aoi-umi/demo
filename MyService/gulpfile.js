var gulp = require('gulp'),
	del = require('del'), //删除文件
	replace = require('gulp-replace-path'); //替换文件内容

gulp.task('clear-all',function(cb){
	del([
		'views_dev/_template_dev/*',
	], cb);
})

gulp.task('template', function() {
  gulp.src('views_dev/_template_dev/*')
		.pipe(replace('<%','{%'))
		.pipe(replace('%>','%}'))
		.pipe(gulp.dest('views_dev/_template'));
});


gulp.task('default',['clear-all','template'])