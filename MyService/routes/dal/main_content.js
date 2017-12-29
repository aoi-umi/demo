var db = require('../_system/db');

exports.detailQuery = function(params, conn) {
	var sql = 'call p_main_content_detail_query(:id)';
	return db.query(sql, params, conn);
};

exports.query = function(params, conn) {
    var sql = 'call p_main_content_query(:id, :type, :status, :user, :title, :description, :create_date_start, :create_date_end, :operate_date_start, :operate_date_end, :operator, :null_list, :page_index, :page_size)';
    return db.query(sql, params, conn);
};

