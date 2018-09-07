import * as db from '../_system/db';
import { Transaction } from '../_system/db';

export type StatisticsType = {
    count: number;
    date: string;
    method: string;
    successCount: number;
}
export let statistics = async function (params, conn?: Transaction) {
    var sql = 'call p_log_statistics(:interval, :method, :createDateStart, :createDateEnd)';
    let t = await db.query(sql, params, conn);
    let data = {
        list: t[0] as StatisticsType[]
    };
    return {
        rawData: t,
        data,
    };
};

