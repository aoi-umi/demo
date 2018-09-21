import * as db from '../_system/db';
import { Transaction } from '../_system/db';
import { AuthorityDataType } from './models/dbModel/Authority';
import { QueryOptions } from '../bll/_auto';
export type _QueryOptions = QueryOptions<AuthorityDataType & {
    anyKey?: string;
    excludeByUserId?: number;
    excludeByRoleCode?: string;
}>;
export let query = async function (params: _QueryOptions, conn?: Transaction) {
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

