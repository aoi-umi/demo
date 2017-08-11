var exports = module.exports;
var common = require('./_system/common');
var cache = require('./_system/cache');
var errorConfig = require('./_system/errorConfig');
var config = require('../config');
var autoBll = require('./_bll/auto');

exports.use = function (req, res, next) {
    var userInfoKey = req.cookies[config.cacheKey.userInfo];
    if (userInfoKey) {
        userInfoKey = config.cacheKey.userInfo + userInfoKey;
        cache.getPromise(userInfoKey).then(function (t) {
            if (t) {
                req.myData.user = t;
            }
            next();
        }).catch(function (e) {
            next(e);
        });
    } else {
        next();
    }
};

exports.get = function (req, res, next) {
    res.myRender('index', common.formatViewtRes({title: 'Express', method: 'get'}));
};

exports.post = function (req, res, next) {
    res.mySend(null, 'post');
};

exports.loginGet = function (req, res, next) {
    if (common.isInList(req.myData.user.auth, 'login'))
        res.redirect('/users');
    else
        res.render('login', common.formatViewtRes({title: 'Login'}));
};

exports.loginPost = function (req, res, next) {
    var userName = req.header('user-name');
    var token = req.header('token');
    var reqBody = req.body;
    login(userName, token, reqBody).then(function (t) {
        var userInfoKey = req.cookies[config.cacheKey.userInfo];
        if (userInfoKey) {
            userInfoKey = config.cacheKey.userInfo + userInfoKey;
            var user = req.myData.user;
            user.nickname = t.nickname;
            user.authority['login'] = true;
            if(t.auth){
                var authList = t.auth.split(',');
                authList.forEach(function (auth) {
                    user.authority[auth] = true;
                });
            }
            var hours = new Date().getHours();
            var seconds = parseInt((24 - hours) * 60 * 60);
            cache.setPromise(userInfoKey, user, seconds);
        }
        res.send(common.formatRes(null, 'post'));
    }).catch(function (e) {
        res.send(common.formatRes(e, e.code));
    });
};

exports.loginOut = function (req, res, next) {
    var userInfoKey = req.cookies[config.cacheKey.userInfo];
    common.promise().then(function () {
        if(userInfoKey) {
            userInfoKey = config.cacheKey.userInfo + userInfoKey;
            return cache.delPromise(userInfoKey);
        }
    }).then(function () {
        res.mySend(null, 'success');
    }).catch(function (e) {
        res.mySend(e, e.code);
    });
};

exports.params = function (req, res, next) {
    res.render('index', common.formatViewtRes({title: 'Express', method: 'params'}));
};

function login(userName, token, req) {
    return common.promise().then(function () {
        if (!userName)
            throw common.error(null, errorConfig.CAN_NOT_BE_EMPTY.code, {
                format: function (msg) {
                    return common.format(msg, 'userName');
                }
            });
        if (!req)
            req = '';
        if (typeof req != 'string')
            req = JSON.stringify(req);
        return autoBll.query('user_info', {account: userName}).then(function (t) {
            if (!t.count)
                throw common.error('no account or password wrong!');
            if (t.count > 1)
                throw common.error('system error: data wrong');
            var userInfo = t.list[0];
            var pwd = userInfo.password;
            var str = userName + pwd + req;
            var checkToken = common.createToken(userName + pwd + req);
            if (token != checkToken)
                throw common.error(null, errorConfig.TOKEN_WRONG.code);
            return userInfo;
        });
    });
}
