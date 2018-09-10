import * as db from '../_system/db';
import { Transaction } from '../_system/db';
import { AuthorityDataType } from './models/dbModel/Authority';
export let query = async function (params, conn?: Transaction) {
    var sql = 'call p_authority_query(:id, :code, :name, :status, :anyKey, :excludeByUserId, :excludeByRoleCode, :orderBy, :nullList, :pageIndex, :pageSize)';
    let t = await db.query(sql, params, conn);
    let data = {
        list: t[0] as AuthorityDataType[],
        count: t[1][0].count as number,
    };
    return {
        rawData: t,
        data,
    };
};

