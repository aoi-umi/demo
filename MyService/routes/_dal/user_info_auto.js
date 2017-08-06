var db = require('../_system/db');
var exports = module.exports;
exports.save = function (params, conn) {
	var sql = 'call p_user_info_save_auto(:id, :account, :password, :nickname, :auth, :edit_datetime, :create_datetime, :remark, :null_list)';
	if(!conn)
		return db.query(sql, params);
	else
		return db.tranQuery(sql, params, conn);
};

exports.del = function (params, conn) {
	var sql = 'call p_user_info_del_auto(:id)';
	if(!conn)
		return db.query(sql, params);
	else
		return db.tranQuery(sql, params, conn);
};

exports.detailQuery = function (params, conn) {
	var sql = 'call p_user_info_detail_query_auto(:id)';
	if(!conn)
		return db.query(sql, params);
	else
		return db.tranQuery(sql, params, conn);
};

exports.query = function (params, conn) {
	var sql = 'call p_user_info_query_auto(:id, :account, :password, :nickname, :auth, :edit_datetime, :create_datetime, :remark, :null_list, :page_index, :page_size)';
	if(!conn)
		return db.query(sql, params);
	else
		return db.tranQuery(sql, params, conn);
};

