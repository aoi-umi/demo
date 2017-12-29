var db = require('../_system/db');
exports.query = function(params, conn) {
	var sql = 'call p_authority_query(:id, :code, :name, :status, :null_list, :page_index, :page_size)';
	return db.query(sql, params, conn);
};

