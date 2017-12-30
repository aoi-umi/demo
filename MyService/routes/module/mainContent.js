/**
 * Created by bang on 2017-9-7.
 */
var common = require('../_system/common');
var myEnum = require('./../_system/enum');
var autoBll = require('../bll/auto');

exports.detailQuery = function (opt, viewOpt) {
    return autoBll.custom('main_content', 'detailQuery', opt, viewOpt).then(function (t) {
        if (viewOpt) {
            viewOpt.mainContentDetail = t;
        }
    });
}