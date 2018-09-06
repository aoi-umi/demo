import { UserInfoWithStructModel } from "../dal/models/dbModel";


export let query = function (opt) {
    return UserInfoWithStructModel.UserInfoWithStruct.customQuery(opt);
};

