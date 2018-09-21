import * as db from '../_system/db';
import { Transaction } from '../_system/db';
import { RoleDataType } from './models/dbModel/Role';
import { AuthorityDataType } from './models/dbModel/Authority';
import { RoleWithAuthorityModel } from './models/dbModel';
import { QueryOptions } from '../bll/_auto';
type RoleWithAuthorityDataType = RoleWithAuthorityModel.RoleWithAuthorityDataType;

export type _DetailQueryOptions = {
    code?: string;
}
export let detailQuery = async function (params: _DetailQueryOptions, conn?: Transaction) {
    var sql = 'call p_role_detail_query(:code)';
    let t = await db.query(sql, params, conn);
    let data = {
        role: t[0][0] as RoleDataType,
        authorityList: t[1] as AuthorityDataType[],
    };
    return {
        rawData: t,
        data,
    };
};

export type _QueryOptions = QueryOptions<RoleDataType & {
    anyKey?: string;
    excludeByUserId?: number;
}>;
export let query = async function (params, conn?: Transaction) {
    var sql = 'call p_role_query(:id, :code, :name, :status, :anyKey, :excludeByUserId, :orderBy, :nullList, :pageIndex, :pageSize)';
    let t = await db.query(sql, params, conn);
    let data = {
        list: t[0] as RoleDataType[],
        count: t[1][0].count as number,
        roleWithAuthorityList: t[2] as RoleWithAuthorityDataType[],
        authorityList: t[3] as AuthorityDataType[],
    };
    return {
        rawData: t,
        data,
    };
};

