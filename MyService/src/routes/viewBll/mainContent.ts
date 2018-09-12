/**
 * Created by bang on 2017-9-7.
 */
import * as mainContentBll from '../bll/mainContent';

export let detailQuery = function (opt, viewOpt) {
    opt.noLog = true;
    return mainContentBll.detailQuery(opt, viewOpt).then(function (t) {
        viewOpt.mainContentDetail = t;
    });
}