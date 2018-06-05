import * as db from '../_system/db';
export let query = function(params?, conn?) {
	var sql = 'call `p_user_info_with_struct_query`(:id, :userInfoId, :struct, :orderBy, :nullList, :pageIndex, :pageSize)';
	return db.query(sql, params, conn);
};

