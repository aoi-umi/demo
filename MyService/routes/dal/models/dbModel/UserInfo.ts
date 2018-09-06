
import * as userInfoDal from '../../userInfo';
import _AutoUserInfo, { _AutoUserInfoDataType } from "../_auto/_auto.userInfo.model";
export type CustomDetailType = userInfoDal.DetailType;
export type UserInfoDataType = _AutoUserInfoDataType;

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