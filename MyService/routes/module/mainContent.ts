/**
 * Created by bang on 2017-9-7.
 */
import * as autoBll from '../bll/_auto';
import * as mainContentBll from '../bll/mainContent';

export let detailQuery = function (opt, viewOpt) {
    return mainContentBll.detailQuery(opt, viewOpt).then(function (t) {
        if (viewOpt) {
            viewOpt.mainContentDetail = t;
        }
    });
}