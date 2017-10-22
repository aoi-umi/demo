var db = require('../_system/db');
exports.save = function(params, conn) {
	var sql = 'call p_log_save_auto(:id, :url, :method, :result, :code, :req, :res, :ip, :create_date, :remark, :guid, :null_list)';
	return db.query(sql, params, conn);
};

exports.del = function(params, conn) {
	var sql = 'call p_log_del_auto(:id)';
	return db.query(sql, params, conn);
};

exports.detailQuery = function(params, conn) {
	var sql = 'call p_log_detail_query_auto(:id)';
	return db.query(sql, params, conn);
};

exports.query = function(params, conn) {
	var sql = 'call p_log_query_auto(:id, :url, :method, :result, :code, :req, :res, :ip, :create_date, :remark, :guid, :null_list, :page_index, :page_size)';
	return db.query(sql, params, conn);
};

