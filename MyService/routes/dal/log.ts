import * as db from '../_system/db';

export let statistics = async function (params, conn?) {
    var sql = 'call p_log_statistics(:interval, :method, :createDateStart, :createDateEnd)';
    let t = await db.query(sql, params, conn);
    let data = {
        list: t[0]
    };
    return {
        rawData: t,
        data,
    };
};

