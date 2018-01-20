var db = require('../_system/db');
exports.detailQuery = function(params, conn) {
	var sql = 'call p_role_detail_query(:code)';
	return db.query(sql, params, conn);
};

exports.query = function(params, conn) {
    var sql = 'call p_role_query(:id, :code, :name, :status, :nullList, :pageIndex, :pageSize)';
    return db.query(sql, params, conn);
};

