var db = require('../_system/db');
exports.query = function (params, conn) {
	var sql = 'call p_log_query(:id, :url, :method, :result, :code, :req, :res, :ip, :createDateStart, :createDateEnd, :remark, :guid, :nullList, :pageIndex, :pageSize)';
	return db.query(sql, params, conn);
};

