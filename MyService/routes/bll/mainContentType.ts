/**
 * Created by bang on 2017-9-5.
 */
import * as autoBll from './_auto';
import * as common from '../_system/common';
import errorConfig from '../_system/errorConfig';
import * as auth from '../_system/auth';

export let save = function (opt) {
    return isExist(opt).then(function (t) {
        if (t.isExist && t.detail.id != opt.id) {
            throw common.error('type [' + opt.type + '] is exist');
        }
        return autoBll.save('mainContentType', opt);
    });
};

export let isExist = function (opt) {
    return common.promise(function () {
        if (!opt || (opt.id != 0 && !opt.id) || !opt.type)
            throw common.error(null, errorConfig.ARGS_ERROR);
        return autoBll.query('mainContentType', { type: opt.type });
    }).then(function (t) {
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
};