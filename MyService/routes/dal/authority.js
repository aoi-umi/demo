var db = require('../_system/db');
exports.query = function(params, conn) {
	var sql = 'call p_authority_query(:id, :code, :name, :status, :anyKey, :excludeByUserId, :excludeByRoleCode, :orderBy, :nullList, :pageIndex, :pageSize)';
	return db.query(sql, params, conn);
};

