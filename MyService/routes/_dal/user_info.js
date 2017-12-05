var db = require('../_system/db');

exports.detailQuery = function(params, conn) {
	var sql = 'call p_user_info_detail_query(:id)';
	return db.query(sql, params, conn);
};

exports.query = function(params, conn) {
    var sql = 'call p_user_info_query(:id, :account, :password, :nickname, :auth, :edit_datetime_start, :edit_datetime_end, :create_datetime_start, :create_datetime_end, :remark, :null_list, :page_index, :page_size)';
    return db.query(sql, params, conn);
};


