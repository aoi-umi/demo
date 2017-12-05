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
    var user = opt.user;
    var now = common.dateFormat(new Date(), 'yyyy-MM-dd HH:mm:ss');
    var userInfoLog = {
        user_info_id: user.id,
        type: 0,
        content: '',
        create_date: now,
    };
    return common.promise().then(function () {
        return autoBll.detailQuery('user_info', {id: user.id}).then(function (t) {
            if (!t || !t.id)
                throw common.error('查询用户信息为空');
            var isChanged = false;
            if (opt.newPassword && opt.newPassword != t.password) {
                if (!opt.password)
                    throw common.error('原密码不能为空', 'ARGS_ERROR');
                if (t.password != opt.password)
                    throw common.error('密码不正确');
                isChanged = true;
                userInfoLog.content += '[修改了密码]';
            } else {
                opt.newPassword = null;
            }
            if (!opt.nickname || opt.nickname == t.nickname)
                opt.nickname = null;
            else {
                isChanged = true;
                userInfoLog.content += `[修改了昵称: ${t.nickname} -> ${opt.nickname} ]`;
            }

            if (!isChanged) {
                throw common.error('没有变更的信息');
            }
        });
    }).then(function () {
        var saveOpt = {
            id: user.id,
            nickname: opt.nickname,
            password: opt.newPassword,
            edit_datetime: now,
        };
        return autoBll.tran(function (conn) {
            return autoBll.save('user_info', saveOpt, conn).then(function () {
                return autoBll.save('user_info_log', userInfoLog, conn);
            });
        });
    }).then(function () {
        if (user.key) {
            if (opt.newPassword)
                return cache.del(opt.user.key);
            else if (opt.nickname) {
                user.nickname = opt.nickname;
                var seconds = 7 * 24 * 3600;
                return cache.set(user.key, user, seconds);
            }
        }
    });
};

exports.detailQuery = function (opt) {
    return autoBll.customDal('user_info', 'detailQuery', {id: opt.id}).then(function (t) {
        var detail = {
            user_info: t[0][0],
            user_info_log: t[1],
        }
        return detail;
    });
};

exports.query = function (opt) {
    return autoBll.customDal('user_info', 'query', opt).then(function (t) {
        var resData = {};
        resData.list = t[0];
        resData.count = t[1][0].count;
        return resData;
    });
};