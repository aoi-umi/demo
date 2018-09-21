
import * as userInfoWithStructDal from '../../userInfoWithStruct';
import _AutoUserInfoWithStruct, { _AutoUserInfoWithStructDataType } from "../_auto/_auto.userInfoWithStruct.model";
export type UserInfoWithStructDataType = _AutoUserInfoWithStructDataType;
export type UserInfoWithStructCustomQueryOptions = userInfoWithStructDal._QueryOptions;
export class UserInfoWithStruct extends _AutoUserInfoWithStruct {
    static async customQuery(params: UserInfoWithStructCustomQueryOptions, conn?) {
        let t = await userInfoWithStructDal.query(params, conn);
        return t.data;
    }
};