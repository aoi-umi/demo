import * as db from '../_system/db';
export let query = function (params, conn?) {
	var sql = 'call p_log_query(:id, :url, :application, :method, :methodName, :result, :code, :req, :res, :ip, :createDateStart, :createDateEnd, :remark, :guid, :requestIp, :nullList, :pageIndex, :pageSize)';
	return db.query(sql, params, conn);
};

