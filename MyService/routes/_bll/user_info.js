/**
 * Created by umi on 2017-8-7.
 */
var autoBll = require('./auto');
var common = require('../_system/common');
var cache = require('../_system/cache');

exports.isAccountExist = function (account) {
    return common.promise().then(function () {
        if (!account)
            throw common.error(null, 'ARGS_ERROR');
        return autoBll.query('user_info', {account: account}).then(function (t) {
            return t.list.length;
        });
    });
};

exports.save = function (opt) {
    var now = common.dateFormat(new Date(), 'yyyy-MM-dd HH:mm:ss');
    return common.promise().then(function () {
        if (opt.newPassword) {
            if (!opt.password)
                throw common.error('原密码不能为空', 'ARGS_ERROR');
            return autoBll.detailQuery('user_info', {id: opt.user.id}).then(function (t) {
                if (!t || !t.id)
                    throw common.error('查询用户信息为空');
                if (t.password != opt.password)
                    throw common.error('密码不正确');
            });
        }
    }).then(function () {
        var saveOpt = {
            id: opt.user.id,
            nickname: opt.nickname || null,
            password: opt.newPassword || null,
            edit_datetime: now,
        };
        return autoBll.save('user_info', saveOpt);
    }).then(function () {
        if(opt.user.key)
            return cache.delPromise(opt.user.key);
    });
};