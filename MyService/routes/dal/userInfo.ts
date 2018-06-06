import * as db from '../_system/db';

export let detailQuery = function (params, conn?) {
    var sql = 'call p_user_info_detail_query(:id, :noLog)';
    return db.query(sql, params, conn);
};

export let query = function (params, conn?) {
    var sql = 'call p_user_info_query(:id, :account, :password, :nickname, :role, :authority, :editDateStart, :editDateEnd, :createDateStart, :createDateEnd, :remark, :nullList, :pageIndex, :pageSize)';
    return db.query(sql, params, conn);
};


