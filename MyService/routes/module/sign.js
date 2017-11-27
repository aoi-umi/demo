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
                    d: t.id,
                    nickname: t.nickname
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
        return autoBll.save('user_info', {
            account: args.account,
            password: args.password,
            create_datetime: new Date()
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
    if(req.myData.autoSignIn){
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
            throw common.error('no account or password wrong!');
        if (t.count > 1)
            throw common.error('system error: data wrong');
        var userInfo = t.list[0];
        var pwd = userInfo.password;
        var checkToken = common.createToken(account + pwd + reqBody);
        if (token != checkToken)
            throw common.error(null, errorConfig.TOKEN_WRONG.code);
        return userInfo;
    }).then(function (t) {
        user.id = t.id;
        user.nickname = t.nickname;
        user.account = t.account;
        user.authority['login'] = true;
        user.reqBody = reqBody;
        user.token = token;
        if (t.auth) {
            var authList = t.auth.split(',');
            authList.forEach(function (auth) {
                user.authority[auth] = true;
            });
        }
        user.cacheDatetime = common.dateFormat(new Date(), 'yyyy-MM-dd HH:mm:ss');

        var userInfoKey = req.cookies[config.cacheKey.userInfo];
        if (userInfoKey) {
            userInfoKey = config.cacheKey.userInfo + userInfoKey;
            var hours = new Date().getHours();
            var seconds = parseInt(24 * 7 * 60 * 60);
            cache.setPromise(userInfoKey, user, seconds);
        }
        return t;
    });
}

function signOut(req, res, next) {
    var userInfoKey = req.cookies[config.cacheKey.userInfo];
    common.promise().then(function () {
        if (userInfoKey) {
            userInfoKey = config.cacheKey.userInfo + userInfoKey;
            return cache.delPromise(userInfoKey);
        }
    }).then(function () {
        res.mySend(null, 'success');
    }).catch(function (e) {
        res.mySend(e, e.code);
    });
}