var db = require('../_system/db');
var exports = module.exports;
exports.save = function (params, conn) {
	var sql = 'call p_log_save_auto(:id, :url, :method, :result, :code, :req, :res, :ip, :create_date, :remark, :null_list)';
	if(!conn)
		return db.query(sql, params);
	else
		return db.tranQuery(sql, params, conn);
};

exports.del = function (params, conn) {
	var sql = 'call p_log_del_auto(:id)';
	if(!conn)
		return db.query(sql, params);
	else
		return db.tranQuery(sql, params, conn);
};

exports.detailQuery = function (params, conn) {
	var sql = 'call p_log_detail_query_auto(:id)';
	if(!conn)
		return db.query(sql, params);
	else
		return db.tranQuery(sql, params, conn);
};

exports.query = function (params, conn) {
	var sql = 'call p_log_query_auto(:id, :url, :method, :result, :code, :req, :res, :ip, :create_date, :remark, :null_list, :page_index, :page_size)';
	if(!conn)
		return db.query(sql, params);
	else
		return db.tranQuery(sql, params, conn);
};

