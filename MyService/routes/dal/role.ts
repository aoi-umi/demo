import * as db from '../_system/db';
export let detailQuery = function(params, conn) {
	var sql = 'call p_role_detail_query(:code)';
	return db.query(sql, params, conn);
};

export let query = function(params, conn) {
    var sql = 'call p_role_query(:id, :code, :name, :status, :anyKey, :excludeByUserId, :orderBy, :nullList, :pageIndex, :pageSize)';
    return db.query(sql, params, conn);
};

