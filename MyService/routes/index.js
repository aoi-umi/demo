var exports = module.exports;
var common = require('./_system/common');
var cache = require('./_system/cache');
var errorConfig = require('./_system/errorConfig');
var config = require('../config');
var myEnum = require('./_system/enum');
var fs = require('fs');

var autoBll = require('./_bll/auto');
var userInfoBll = require('./_bll/user_info');
var logBll = require('./_bll/log');

exports.post = function (req, res, next) {
    res.mySend(null, 'post');
};

//login
exports.signUp = function (req, res) {
    var args = req.body;
    common.promise().then(function (e) {
        if (!args.userName)
            throw common.error('', 'CAN_NOT_BE_EMPTY', {
                format: function (msg) {
                    return common.stringFormat(msg, '用户名');
                }
            });
        return userInfoBll.isAccountExist(args.userName);
    }).then(function (t) {
        if (t)
            throw common.error('account is exist!');
        return autoBll.save('user_info', {
            account: args.userName,
            password: args.pwd,
            create_datetime: new Date()
        });
    }).then(function (t) {
        res.send(common.formatRes(null, t));
    }).fail(function (e) {
        res.send(common.formatRes(e));
    });
};

exports.loginGet = function (req, res, next) {
    if (req.myData.user.authority['login'])
        res.redirect('/');
    else
        res.myRender('view', {view: 'login', title: 'Login'});
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

function login(userName, token, req) {
    return common.promise().then(function () {
        if (!userName)
            throw common.error(null, errorConfig.CAN_NOT_BE_EMPTY.code, {
                format: function (msg) {
                    return common.stringFormat(msg, 'userName');
                }
            });
        if (!req)
            req = '';
        if (typeof req != 'string')
            req = JSON.stringify(req);
        return autoBll.query('user_info', {account: userName});
    }).then(function (t) {
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
}

exports.status = function (req, res) {
    var opt = {
        view: 'status',
        enumDict: myEnum.enumDict,
        enumCheck: myEnum.enumCheck,
    };
    res.myRender('view', opt);
};

exports.tranTest = function(req, res){
    var reqData = req.body;
    logBll.tranTest(reqData).then(function(t){
        res.mySend(null, t);
    }).fail(function(e){
        res.mySend(e, null,{code: '400'});
    })
};

exports.upload = [require('./_system/multer').any(), function (req, res) {
    var success = req.files && req.files.length ? 'upload ' + req.files.length + ' file(s) success' : 'upload failed';
    if(req.files) {
        req.files.forEach(function (file) {
            var readStream = fs.createReadStream(file.path);
            common.streamToBuffer(readStream).then(function (buffer) {
                return common.md5(buffer);
            }).then(function (filename){
                fs.rename(file.path, file.destination + '/' + filename);
            });
        });
    }
    var opt = {
        view: 'msg',
        message: success,
    };
    res.myRender('view', opt);
}];
