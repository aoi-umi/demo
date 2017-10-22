var db = require('../_system/db');
exports.save = function(params, conn) {
	var sql = 'call p_main_content_type_save_auto(:id, :type, :type_name, :parent_type, :level, :null_list)';
	return db.query(sql, params, conn);
};

exports.del = function(params, conn) {
	var sql = 'call p_main_content_type_del_auto(:id)';
	return db.query(sql, params, conn);
};

exports.detailQuery = function(params, conn) {
	var sql = 'call p_main_content_type_detail_query_auto(:id)';
	return db.query(sql, params, conn);
};

exports.query = function(params, conn) {
	var sql = 'call p_main_content_type_query_auto(:id, :type, :type_name, :parent_type, :level, :null_list, :page_index, :page_size)';
	return db.query(sql, params, conn);
};

