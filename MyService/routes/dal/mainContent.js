var db = require('../_system/db');

exports.detailQuery = function(params, conn) {
	var sql = 'call p_main_content_detail_query(:id)';
	return db.query(sql, params, conn);
};

exports.query = function(params, conn) {
    var sql = 'call p_main_content_query(:id, :type, :status, :user, :title, :description, :createDateStart, :createDateEnd, :operateDateStart, :operateDateEnd, :operator, :nullList, :pageIndex, :pageSize)';
    return db.query(sql, params, conn);
};

