var autoBll = require('./auto');
var common = require('../_system/common');
var authority = exports;

exports.save = function (opt) {
    return common.promise().then(function () {
        return authority.isExist(opt);
    }).then(function (t) {
        if (t)
            throw common.error(`code[${opt.code}]已存在`);
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
        if(t.list.length && t.list[0].id != opt.id){
            result = true;
        }
        return result;
    });
}

