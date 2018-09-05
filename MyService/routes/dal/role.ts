import * as db from '../_system/db';
export let detailQuery = async function (params, conn?) {
    var sql = 'call p_role_detail_query(:code)';
    let t = await db.query(sql, params, conn);
    let data = {
        role: t[0][0],
        authorityList: t[1],
    };
    return {
        rawData: t,
        data,
    };
};

export let query = async function (params, conn?) {
    var sql = 'call p_role_query(:id, :code, :name, :status, :anyKey, :excludeByUserId, :orderBy, :nullList, :pageIndex, :pageSize)';
    let t = await db.query(sql, params, conn);
    let data = {
        list: t[0],
        count: t[1][0].count,
        roleWithAuthorityList: t[2],
        authorityList: t[3],
    };
    return {
        rawData: t,
        data,
    };
};

