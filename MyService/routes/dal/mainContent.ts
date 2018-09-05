import * as db from '../_system/db';

export let detailQuery = async function (params, conn?) {
    var sql = 'call p_main_content_detail_query(:id, :noLog)';
    let t = await db.query(sql, params, conn);
    let data = {
        mainContent: t[0][0],
        mainContentTypeList: t[1],
        mainContentChildList: t[2],
        mainContentLogList: t[3]
    };
    return {
        rawData: t,
        data
    };
};

export let query = async function (params, conn?) {
    var sql = 'call p_main_content_query(:id, :type, :status, :user, :title, :description, :createDateStart, :createDateEnd, :operateDateStart, :operateDateEnd, :operator, :nullList, :pageIndex, :pageSize)';
    let t = await db.query(sql, params, conn);
    var data = {
        list: t[0],
        count: t[1][0].count,
        statusList: t[2]
    };
    return {
        rawData: t,
        data
    };
};

