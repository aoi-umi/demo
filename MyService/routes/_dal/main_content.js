var db = require('../_system/db');

exports.detailQuery = function(params, conn) {
	var sql = 'call p_main_content_detail_query(:id)';
	return db.query(sql, params, conn);
};

