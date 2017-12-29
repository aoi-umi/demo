var db = require('../_system/db');
exports.save = function(params, conn) {
	var sql = 'call p_main_content_save_auto(:id, :type, :status, :user_info_id, :user_info, :title, :description, :create_date, :operate_date, :operator, :null_list)';
	return db.query(sql, params, conn);
};

exports.del = function(params, conn) {
	var sql = 'call p_main_content_del_auto(:id)';
	return db.query(sql, params, conn);
};

exports.detailQuery = function(params, conn) {
	var sql = 'call p_main_content_detail_query_auto(:id)';
	return db.query(sql, params, conn);
};

exports.query = function(params, conn) {
	var sql = 'call p_main_content_query_auto(:id, :type, :status, :user_info_id, :user_info, :title, :description, :create_date, :operate_date, :operator, :null_list, :page_index, :page_size)';
	return db.query(sql, params, conn);
};

