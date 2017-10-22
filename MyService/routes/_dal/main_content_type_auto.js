var db = require('../_system/db');
module.exports = {
	save: function(params, conn) {
		var sql = 'call p_main_content_type_save_auto(:id, :type, :type_name, :parent_type, :level, :null_list)';
		return db.query(sql, params, conn);
	},

	del: function(params, conn) {
		var sql = 'call p_main_content_type_del_auto(:id)';
		return db.query(sql, params, conn);
	},

	detailQuery: function(params, conn) {
		var sql = 'call p_main_content_type_detail_query_auto(:id)';
		return db.query(sql, params, conn);
	},

	query: function(params, conn) {
		var sql = 'call p_main_content_type_query_auto(:id, :type, :type_name, :parent_type, :level, :null_list, :page_index, :page_size)';
		return db.query(sql, params, conn);
	},

};
