
import * as userInfoDal from '../../userInfo';
import _AutoUserInfo, { _AutoUserInfoDataType } from "../_auto/_auto.userInfo.model";
export type UserInfoCustomDetailType = userInfoDal.DetailType;
export type UserInfoDataType = _AutoUserInfoDataType;
export type UserInfoRoleAuthorityType = userInfoDal.RoleAuthorityType;

export class UserInfo extends _AutoUserInfo {
    static async customQuery(params, conn?) {
        let t = await userInfoDal.query(params, conn);
        return t.data;
    }
    static async customDetailQuery(params, conn?) {
        let t = await userInfoDal.detailQuery(params, conn);
        return t.data;
    }
};