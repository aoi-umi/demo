import * as db from '../_system/db';

export let statistics = function (params, conn?) {
	var sql = 'call p_log_statistics(:interval, :method, :createDateStart, :createDateEnd)';
	return db.query(sql, params, conn);
};

