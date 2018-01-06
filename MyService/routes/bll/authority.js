var autoBll = require('./auto');
var common = require('../_system/common');
var authority = exports;

exports.save = function (opt) {
    return common.promise().then(function () {
        if (opt.statusUpdateOnly) {
            if (!opt.id || opt.id == 0)
                throw common.error('id不能为空');
            opt = {
                id: opt.id,
                status: opt.status
            };
        } else {
            return authority.isExist(opt).then(function (t) {
                if(t)
                    throw common.error(`code[${opt.code}]已存在`);
            });
        }
    }).then(function (t) {
        return autoBll.save('authority', opt);
    });
};

exports.isExist = function (opt) {
    var code = opt.code;
    return common.promise().then(function () {
        if (!code)
            throw common.error('code不能为空');
        return autoBll.query('authority', {code: code});
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

exports.query = function (opt) {
    return autoBll.customDal('authority', 'query', opt).then(function (t) {
        return {
            list: t[0],
            count: t[1][0].count,
        };
    })
}

