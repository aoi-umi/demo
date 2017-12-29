﻿var db = require('../_system/db');
exports.save = function(params, conn) {
	var sql = 'call p_role_save_auto(:id, :code, :name, :status, :null_list)';
	return db.query(sql, params, conn);
};

exports.del = function(params, conn) {
	var sql = 'call p_role_del_auto(:id)';
	return db.query(sql, params, conn);
};

exports.detailQuery = function(params, conn) {
	var sql = 'call p_role_detail_query_auto(:id)';
	return db.query(sql, params, conn);
};

exports.query = function(params, conn) {
	var sql = 'call p_role_query_auto(:id, :code, :name, :status, :null_list, :page_index, :page_size)';
	return db.query(sql, params, conn);
};

