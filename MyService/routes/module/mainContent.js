/**
 * Created by bang on 2017-9-7.
 */
var autoBll = require('../bll/_auto');
var mainContentBll = require('../bll/mainContent');

exports.detailQuery = function (opt, viewOpt) {
    return mainContentBll.detailQuery(opt, viewOpt).then(function (t) {
        if (viewOpt) {
            viewOpt.mainContentDetail = t;
        }
    });
}