import { UserInfoWithStruct } from "../dal/models/dbModel/UserInfoWithStruct";


export let query = function (opt) {
    return UserInfoWithStruct.customQuery(opt);
};

