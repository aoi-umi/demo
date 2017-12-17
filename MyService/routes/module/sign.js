var common = require('../_system/common');
var cache = require('../_system/cache');
var config = require('../../config');
var errorConfig = require('../_system/errorConfig');
var autoBll = require('../_bll/auto');

exports.sign = function (req, res, next) {
    var method = req.params.method;
    switch (method) {
        case 'up':
            signUp(req, res, next);
            break;
        case 'in':
            signIn(req).then(function (t) {
                return res.mySend(null, {
                    id: t.user_info.id,
                    nickname: t.user_info.nickname
                });
            }).fail(function (e) {
                return res.mySend(e);
            });
            break;
        case 'out':
            signOut(req, res, next);
            break;
        default:
            next();
    }
};

function signUp(req, res, next) {
    var args = req.body;
    var user_info_id = 0;
    return common.promise().then(function (e) {
        if (!args.account)
            throw common.error('', 'CAN_NOT_BE_EMPTY', {
                format: function (msg) {
                    return common.stringFormat(msg, '用户名');
                }
            });
        return autoBll.custom('user_info', 'isAccountExist', args.account)
    }).then(function (t) {
        if (t)
            throw common.error('account is exist!');
        return autoBll.tran(function (conn) {
            return autoBll.save('user_info', {
                account: args.account,
                password: args.password,
                nickname: args.nickname,
                create_datetime: new Date()
            }, conn).then(function (t) {
                user_info_id = t;
                //默认角色
                return autoBll.save('user_info_with_role', {user_info_id: user_info_id, role_code: 'default'}, conn);
            }).then(function () {
                return user_info_id;
            });
        });
    }).then(function (t) {
        res.send(common.formatRes(null, t));
    }).fail(function (e) {
        res.send(common.formatRes(e));
    });
}

var signIn = exports.signIn = function (req, signInReq) {
    var account = req.header('account');
    var token = req.header('token');
    var reqBody = req.body;
    var user = req.myData.user;
    if (req.myData.autoSignIn) {
        account = user.account;
        token = user.token;
        reqBody = user.reqBody;
    }
    return common.promise().then(function () {
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
        return autoBll.query('user_info', {account: account});
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
        return autoBll.custom('user_info', 'detailQuery', {id: userInfo.id});
    }).then(function (t) {
        //console.log(t);
        var userInfo = t.user_info;
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

function signOut(req, res, next) {
    var userInfoKey = req.cookies[config.cacheKey.userInfo];
    common.promise().then(function () {
        if (userInfoKey) {
            userInfoKey = config.cacheKey.userInfo + userInfoKey;
            return cache.del(userInfoKey);
        }
    }).then(function () {
        res.mySend(null, 'success');
    }).fail(function (e) {
        res.mySend(e, e.code);
    });
}