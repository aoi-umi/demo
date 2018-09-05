import { UserInfoWithStruct } from "../dal/models/dbModel";


export let query = function (opt) {
    return UserInfoWithStruct.customQuery(opt);
};

