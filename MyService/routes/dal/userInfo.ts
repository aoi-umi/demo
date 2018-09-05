import * as db from '../_system/db';

export let detailQuery = async function (params, conn?) {
    var sql = 'call p_user_info_detail_query(:id, :noLog)';
    let t = await db.query(sql, params, conn);
    let data = {
        userInfo: t[0][0],
        userInfoLog: t[1],
        authorityList: t[2],
        roleList: t[3],
        roleAuthorityList: t[4],
        structList: t[5]
    };
    return {
        rawData: t,
        data
    };
};

export let query = async function (params, conn?) {
    var sql = 'call p_user_info_query(:id, :account, :password, :nickname, :role, :authority, :editDateStart, :editDateEnd, :createDateStart, :createDateEnd, :remark, :nullList, :pageIndex, :pageSize)';
    let t = await db.query(sql, params, conn);
    let data = {
        list: t[0],
        count: t[1][0].count,
        userInfoWithAuthorityList: t[2],
        authorityList: t[3],
        userInfoWithRoleList: t[4],
        roleList: t[5],
        roleAuthorityList: t[6],
    };
    return {
        rawData: t,
        data
    };
};


