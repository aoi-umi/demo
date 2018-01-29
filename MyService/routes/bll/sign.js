var common = require('../_system/common');
var cache = require('../_system/cache');
var config = require('../../config');
var errorConfig = require('../_system/errorConfig');
var autoBll = require('./_auto');
var userInfoBll = require('./userInfo');
var signBll = exports;

exports.up = function (opt, exOpt) {
    var userInfoId = 0;
    return common.promise(function (e) {
        if (!opt.account)
            throw common.error('', 'CAN_NOT_BE_EMPTY', {
                format: function (msg) {
                    return common.stringFormat(msg, '用户名');
                }
            });
        return autoBll.custom('userInfo', 'isAccountExist', opt.account)
    }).then(function (t) {
        if (t)
            throw common.error('account is exist!');
        return autoBll.tran(function (conn) {
            return autoBll.save('userInfo', {
                account: opt.account,
                password: opt.password,
                nickname: opt.nickname,
                createDate: new Date()
            }, conn).then(function (t) {
                userInfoId = t;
                //默认角色
                return autoBll.save('userInfoWithRole', {
                    userInfoId: userInfoId,
                    roleCode: 'default'
                }, conn);
            }).then(function () {
                //日志
                var userInfoLog = userInfoBll.createLog();
                userInfoLog.userInfoId = userInfoId;
                userInfoLog.content = '[创建账号]';
                return autoBll.save('userInfoLog', userInfoLog, conn);
            });
        });
    }).then(function (t) {
        return userInfoId;
    });
};

exports.out = function (opt, exOpt) {
    var user = exOpt.user;
    return common.promise(function () {
        if (user.key) {
            return cache.del(user.key);
        }
    }).then(function () {
        return 'success'
    });
};

exports.in = function (opt, exOpt) {
    return signBll.inInside(exOpt.req).then(function (t) {
        return {
            id: t.userInfo.id,
            nickname: t.userInfo.nickname
        };
    });
};

//内部调用
exports.inInside = function (req) {
    var account = req.header('account');
    var token = req.header('token');
    var reqBody = req.body;
    var user = req.myData.user;
    if (req.myData.autoSignIn) {
        account = user.account;
        token = user.token;
        reqBody = user.reqBody;
    }
    return common.promise(function () {
        if (!account)
            throw common.error(null, errorConfig.CAN_NOT_BE_EMPTY.code, {
                format: function (msg) {
                    return common.stringFormat(msg, 'account');
                }
            });
        if (!reqBody)
            reqBody = '';
        if (typeof reqBody != 'string')
            reqBody = JSON.stringify(reqBody);
        return autoBll.query('userInfo', {account: account});
    }).then(function (t) {
        if (!t.count)
            throw common.error('no account!');
        if (t.count > 1)
            throw common.error('system error: data wrong');
        var userInfo = t.list[0];
        var pwd = userInfo.password;
        var checkToken = common.createToken(account + pwd + reqBody);
        if (token != checkToken)
            throw common.error(null, errorConfig.TOKEN_WRONG.code);
        return autoBll.custom('userInfo', 'detailQuery', {id: userInfo.id});
    }).then(function (t) {
        //console.log(t);
        var userInfo = t.userInfo;
        user.id = userInfo.id;
        user.nickname = userInfo.nickname;
        user.account = userInfo.account;
        user.authority['login'] = true;
        user.reqBody = reqBody;
        user.token = token;
        for (var key in t.auth) {
            user.authority[key] = true;
        }
        user.cacheDatetime = common.dateFormat(new Date(), 'yyyy-MM-dd HH:mm:ss');

        var userInfoKey = req.cookies[config.cacheKey.userInfo];
        if (userInfoKey) {
            userInfoKey = config.cacheKey.userInfo + userInfoKey;
            user.key = userInfoKey;
            var seconds = 7 * 24 * 3600;
            cache.set(userInfoKey, user, seconds);
        }
        return t;
    });
};