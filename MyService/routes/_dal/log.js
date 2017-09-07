﻿var db = require('../_system/db');
var exports = module.exports;


exports.query = function (params, conn) {
	var sql = 'call p_log_query_auto(:id, :url, :method, :result, :code, :req, :res, :ip, :create_date, :remark, :guid, :null_list, :page_index, :page_size)';
	if(!conn)
		return db.query(sql, params);
	else
		return db.tranQuery(sql, params, conn);
};

