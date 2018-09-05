
import * as userInfoWithStructDal from '../../userInfoWithStruct';
import _AutoUserInfoWithStruct from "../_auto/_auto.userInfoWithStruct.model";
export class UserInfoWithStruct extends _AutoUserInfoWithStruct {
    static async customQuery(params, conn?) {
        let t = await userInfoWithStructDal.query(params, conn);
        return t.data;
    }
};