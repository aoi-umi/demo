/**
 * Created by bang on 2017-9-5.
 */
var autoBll = require('./_auto');
var common = require('../_system/common');
var errorConfig = require('../_system/errorConfig');
var auth = require('../_system/auth');
var mainContentTypeBll = exports;
exports.save = function (opt) {
    return mainContentTypeBll.isExist(opt).then(function (t) {
        if (t.isExist && t.detail.id != opt.id) {
            throw common.error('type [' + opt.type + '] is exist');
        }
        return autoBll.save('mainContentType', opt);
    });
};

exports.isExist = function (opt) {
    return common.promise().then(function () {
        if (!opt || (opt.id != 0 && !opt.id) || !opt.type)
            throw common.error(null, errorConfig.ARGS_ERROR);
        return autoBll.query('mainContentType', {type: opt.type}).then(function (t) {
            var res = {
                isExist: false,
                detail: null,
            };
            if (t.count == 1) {
                res.isExist = true;
                res.detail = t.list[0];
            }
            //数据有误
            if (t.count > 1//存在多个时
                || (res.isExist && !res.detail)//存在但详细为空时
            ) {

                throw common.error('data error');
            }
            return res;
        });
    });
};