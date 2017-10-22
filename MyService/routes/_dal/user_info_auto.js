var db = require('../_system/db');
module.exports = {
	save: function(params, conn) {
		var sql = 'call p_user_info_save_auto(:id, :account, :password, :nickname, :auth, :edit_datetime, :create_datetime, :remark, :null_list)';
		return db.query(sql, params, conn);
	},

	del: function(params, conn) {
		var sql = 'call p_user_info_del_auto(:id)';
		return db.query(sql, params, conn);
	},

	detailQuery: function(params, conn) {
		var sql = 'call p_user_info_detail_query_auto(:id)';
		return db.query(sql, params, conn);
	},

	query: function(params, conn) {
		var sql = 'call p_user_info_query_auto(:id, :account, :password, :nickname, :auth, :edit_datetime, :create_datetime, :remark, :null_list, :page_index, :page_size)';
		return db.query(sql, params, conn);
	},

};
