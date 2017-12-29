var db = require('../_system/db');
exports.save = function(params, conn) {
	var sql = 'call p_user_info_with_authority_save_auto(:id, :user_info_id, :authority_code, :null_list)';
	return db.query(sql, params, conn);
};

exports.del = function(params, conn) {
	var sql = 'call p_user_info_with_authority_del_auto(:id)';
	return db.query(sql, params, conn);
};

exports.detailQuery = function(params, conn) {
	var sql = 'call p_user_info_with_authority_detail_query_auto(:id)';
	return db.query(sql, params, conn);
};

exports.query = function(params, conn) {
	var sql = 'call p_user_info_with_authority_query_auto(:id, :user_info_id, :authority_code, :null_list, :page_index, :page_size)';
	return db.query(sql, params, conn);
};

