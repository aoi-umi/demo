var db = require('../_system/db');
exports.detailQuery = function(params, conn) {
	var sql = 'call p_role_detail_query(:id)';
	return db.query(sql, params, conn);
};

exports.query = function(params, conn) {
    var sql = 'call p_role_query(:id, :code, :name, :status, :null_list, :page_index, :page_size)';
    return db.query(sql, params, conn);
};

