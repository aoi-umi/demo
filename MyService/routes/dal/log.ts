import * as db from '../_system/db';
export let query = function (params, conn?) {
	var sql = 'call p_log_query(:id, :url, :method, :result, :code, :req, :res, :ip, :createDateStart, :createDateEnd, :remark, :guid, :nullList, :pageIndex, :pageSize)';
	return db.query(sql, params, conn);
};

