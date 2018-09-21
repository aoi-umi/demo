﻿import * as db from '../_system/db';
import { Transaction } from '../_system/db';
import { UserInfoDataType } from './models/dbModel/UserInfo';
import { RoleDataType } from './models/dbModel/Role';
import { AuthorityDataType } from './models/dbModel/Authority';
import { UserInfoWithRoleModel, UserInfoLogModel, StructModel, RoleWithAuthorityModel, UserInfoWithAuthorityModel } from './models/dbModel';
import { QueryOptions } from '../bll/_auto';
type UserInfoWithRoleDataType = UserInfoWithRoleModel.UserInfoWithRoleDataType;
type UserInfoLogDataType = UserInfoLogModel.UserInfoLogDataType;
type StructDataType = StructModel.StructDataType;
type UserInfoWithAuthorityDataType = UserInfoWithAuthorityModel.UserInfoWithAuthorityDataType;
export type DetailType = {
    userInfo?: UserInfoDataType;
    userInfoLogList?: UserInfoLogDataType[];
    authorityList: AuthorityDataType[];
    roleList: RoleDataType[];
    roleAuthorityList: RoleAuthorityType[];
    structList?: StructDataType[];
}

export type RoleAuthorityType = AuthorityDataType & {
    roleCode: string,
    roleStatus: number,
}

export type _DetailQueryOptions = {
    id?: number;
}
export let detailQuery = async function (params: _DetailQueryOptions, conn?: Transaction) {
    var sql = 'call p_user_info_detail_query(:id)';
    let t = await db.query(sql, params, conn);
    let data: DetailType = {
        userInfo: t[0][0],
        authorityList: t[1],
        roleList: t[2],
        roleAuthorityList: t[3],
        structList: t[4]
    };
    return {
        rawData: t,
        data
    };
};

export type _QueryOptions = QueryOptions<UserInfoDataType & {
    editDateStart?: string;
    editDateEnd?: string;
    createDateStart?: number;
    createDateEnd?: number;
}>;
export let query = async function (params: _QueryOptions, conn?: Transaction) {
    var sql = 'call p_user_info_query(:id, :account, :password, :nickname, :role, :authority, :editDateStart, :editDateEnd, :createDateStart, :createDateEnd, :remark, :nullList, :pageIndex, :pageSize)';
    let t = await db.query(sql, params, conn);
    let data = {
        list: t[0] as UserInfoDataType[],
        count: t[1][0].count as number,
        userInfoWithAuthorityList: t[2] as UserInfoWithAuthorityDataType[],
        authorityList: t[3] as AuthorityDataType[],
        userInfoWithRoleList: t[4] as UserInfoWithRoleDataType[],
        roleList: t[5] as RoleDataType[],
        roleAuthorityList: t[6] as RoleAuthorityType[],
    };
    return {
        rawData: t,
        data
    };
};


