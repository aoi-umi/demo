import * as db from '../_system/db';
import { Transaction } from '../_system/db';
import { UserInfoWithStructDataType } from './models/dbModel/UserInfoWithStruct';
export let query = async function (params?, conn?: Transaction) {
    var sql = 'call `p_user_info_with_struct_query`(:id, :userInfoId, :struct, :orderBy, :nullList, :pageIndex, :pageSize)';
    let t = await db.query(sql, params, conn);
    let data = {
        list: t[0] as (UserInfoWithStructDataType & { type: string })[],
        count: t[1][0].count as number,
    };
    return {
        rawData: t,
        data
    };
};

