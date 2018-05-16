
import * as autoBll from './_auto';
import * as common from '../_system/common';
import * as authorityDal from '../dal/authority';

export let save = function (opt) {
    return common.promise(function () {
        if (opt.statusUpdateOnly) {
            if (!opt.id || opt.id == 0)
                throw common.error('id不能为空');
            opt = {
                id: opt.id,
                status: opt.status
            };
        } else {
            return isExist(opt).then(function (t) {
                if (t)
                    throw common.error(`code[${opt.code}]已存在`);
            });
        }
    }).then(function (t) {
        return autoBll.save('authority', opt);
    });
};

export let isExist = function (opt) {
    var code = opt.code;
    return common.promise(function () {
        if (!code)
            throw common.error('code不能为空');
        return autoBll.query('authority', { code: code });
    }).then(function (t) {
        var result = false;
        if (t.list.length > 1)
            throw common.error('数据库中存在重复权限');
        if (t.list.length && t.list[0].id != opt.id) {
            result = true;
        }
        return result;
    });
};

export let query = function (opt) {
    if (opt.id || opt.anyKey) {
        delete opt.code;
        delete opt.name;
        if (opt.id) {
            delete opt.anyKey;
        }
    }
    opt.orderBy = 'code';
    return authorityDal.query(opt).then(function (t) {
        return {
            list: t[0],
            count: t[1][0].count,
        };
    })
};

