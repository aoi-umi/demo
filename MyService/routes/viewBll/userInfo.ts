/**
 * Created by bang on 2017-9-7.
 */
import * as userInfoBll from '../bll/userInfo';

export let detailQuery = function (opt, viewOpt) {
    return userInfoBll.detailQuery(opt).then(function (t) {
        if (viewOpt) {
            viewOpt.userInfoDetail = t;
        }
    });
}