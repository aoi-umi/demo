import * as db from '../_system/db';
import * as UserInfoModel from './models/dbModel/UserInfo';

export type DetailType = {
    userInfo?: any;
    userInfoLog?: any;
    authorityList: any[];
    roleList: any[];
    roleAuthorityList: any[];
    structList?: any[];
}

export let detailQuery = async function (params, conn?) {
    var sql = 'call p_user_info_detail_query(:id, :noLog)';
    let t = await db.query(sql, params, conn);
    let data: DetailType = {
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
        list: t[0] as UserInfoModel.UserInfoDataType[],
        count: t[1][0].count as number,
        userInfoWithAuthorityList: t[2] as any[],
        authorityList: t[3] as any[],
        userInfoWithRoleList: t[4] as any[],
        roleList: t[5] as any[],
        roleAuthorityList: t[6] as any[],
    };
    return {
        rawData: t,
        data
    };
};


