/**
 * Created by bang on 2017-9-7.
 */
var autoBll = require('../bll/_auto');

exports.detailQuery = function (opt, viewOpt) {
    return autoBll.custom('mainContent', 'detailQuery', opt, viewOpt).then(function (t) {
        if (viewOpt) {
            viewOpt.mainContentDetail = t;
        }
    });
}