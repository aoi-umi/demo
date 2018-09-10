
import * as userInfoWithStructDal from '../../userInfoWithStruct';
import _AutoUserInfoWithStruct, { _AutoUserInfoWithStructDataType } from "../_auto/_auto.userInfoWithStruct.model";
export type UserInfoWithStructDataType = _AutoUserInfoWithStructDataType;
export class UserInfoWithStruct extends _AutoUserInfoWithStruct {
    static async customQuery(params, conn?) {
        let t = await userInfoWithStructDal.query(params, conn);
        return t.data;
    }
};