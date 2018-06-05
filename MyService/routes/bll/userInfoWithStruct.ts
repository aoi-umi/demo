import * as userInfoWithStructDal from '../dal/userInfoWithStruct';

export let query = function (opt) {
    return userInfoWithStructDal.query(opt).then(function (t) {
        return {
            list: t[0],
            count: t[1][0].count,
        }
    });
};

