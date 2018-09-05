import * as db from '../_system/db';
export let query = async function (params?, conn?) {
    var sql = 'call `p_user_info_with_struct_query`(:id, :userInfoId, :struct, :orderBy, :nullList, :pageIndex, :pageSize)';
    let t = await db.query(sql, params, conn);
    let data = {
        list: t[0],
        count: t[1][0].count,
    };
    return {
        rawData: t,
        data
    };
};

