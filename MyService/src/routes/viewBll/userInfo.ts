/**
 * Created by bang on 2017-9-7.
 */
import * as common from '../_system/common';
import errorConfig from '../_system/errorConfig';
import * as userInfoBll from '../bll/userInfo';
import { isHadAuthority, authConfig } from '../_system/auth';

export let detailQuery = function (opt, viewOpt) {
    let req = viewOpt.req;
    var query = req.query;
    var user = viewOpt.user;
    var userInfoId = user.id;
    if (query.id && query.id != userInfoId) {
        isHadAuthority(user, authConfig.admin, { throwError: true });
        userInfoId = query.id;
    }
    return userInfoBll.detailQuery(opt).then(function (t) {
        if (!t)
            throw common.error(null, errorConfig.DB_NO_DATA);
        viewOpt.userInfoDetail = t;
    });
}