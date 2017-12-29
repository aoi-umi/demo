var db = require('../_system/db');
exports.save = function(params, conn) {
	var sql = 'call p_main_content_tag_save_auto(:id, :main_content_id, :name, :null_list)';
	return db.query(sql, params, conn);
};

exports.del = function(params, conn) {
	var sql = 'call p_main_content_tag_del_auto(:id)';
	return db.query(sql, params, conn);
};

exports.detailQuery = function(params, conn) {
	var sql = 'call p_main_content_tag_detail_query_auto(:id)';
	return db.query(sql, params, conn);
};

exports.query = function(params, conn) {
	var sql = 'call p_main_content_tag_query_auto(:id, :main_content_id, :name, :null_list, :page_index, :page_size)';
	return db.query(sql, params, conn);
};

