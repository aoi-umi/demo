var db = require('../_system/db');
exports.save = function(params, conn) {
	var sql = 'call p_user_info_authority_id_save_auto(:id, :user_info_id, :authority_id, :null_list)';
	return db.query(sql, params, conn);
};

exports.del = function(params, conn) {
	var sql = 'call p_user_info_authority_id_del_auto(:id)';
	return db.query(sql, params, conn);
};

exports.detailQuery = function(params, conn) {
	var sql = 'call p_user_info_authority_id_detail_query_auto(:id)';
	return db.query(sql, params, conn);
};

exports.query = function(params, conn) {
	var sql = 'call p_user_info_authority_id_query_auto(:id, :user_info_id, :authority_id, :null_list, :page_index, :page_size)';
	return db.query(sql, params, conn);
};

