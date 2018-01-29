var db = require('../_system/db');

exports.detailQuery = function(params, conn) {
	var sql = 'call p_user_info_detail_query(:id)';
	return db.query(sql, params, conn);
};

exports.query = function(params, conn) {
    var sql = 'call p_user_info_query(:id, :account, :password, :nickname, :role, :authority, :editDateStart, :editDateEnd, :createDateStart, :createDateEnd, :remark, :nullList, :pageIndex, :pageSize)';
    return db.query(sql, params, conn);
};


