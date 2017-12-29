var db = require('../_system/db');
exports.save = function(params, conn) {
	var sql = 'call p_main_content_child_save_auto(:id, :num, :main_content_id, :type, :content, :null_list)';
	return db.query(sql, params, conn);
};

exports.del = function(params, conn) {
	var sql = 'call p_main_content_child_del_auto(:id)';
	return db.query(sql, params, conn);
};

exports.detailQuery = function(params, conn) {
	var sql = 'call p_main_content_child_detail_query_auto(:id)';
	return db.query(sql, params, conn);
};

exports.query = function(params, conn) {
	var sql = 'call p_main_content_child_query_auto(:id, :num, :main_content_id, :type, :content, :null_list, :page_index, :page_size)';
	return db.query(sql, params, conn);
};

