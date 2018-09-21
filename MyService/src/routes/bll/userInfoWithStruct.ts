import { UserInfoWithStruct, UserInfoWithStructCustomQueryOptions } from "../dal/models/dbModel/UserInfoWithStruct";


export let query = function (opt: UserInfoWithStructCustomQueryOptions) {
    return UserInfoWithStruct.customQuery(opt);
};

