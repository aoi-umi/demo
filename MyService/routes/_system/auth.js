/**
 * Created by umi on 2017-5-29.
 */
var _ = require('underscore');
var common = require('./common');
var errorConfig = require('./errorConfig');
var auth = exports;
exports.auth = function (req, res, next) {
    //url权限认证
    var auth = req.myData.auth;
    var user = req.myData.user;
    // console.log(user.authority);
    // console.log(auth);
    var permissionRes = authorityCheck(user, auth);
    if (permissionRes.noPermission) {
        var err = common.error('', permissionRes.errCode || errorConfig.NO_PERMISSIONS.code);
        err.status = 403;
        if (errorConfig.DEV.code == permissionRes.errCode) {
            err.message = 'Not Found';
            err.code = err.status = 404;
        }
        next(err);
    } else {
        next();
    }
};

exports.isHadAuthority = function (user, auth) {
    if (typeof auth == 'string')
        auth = auth.split(',');
    for (var i = 0; i < auth.length; i++) {
        var item = auth[i];
        if (!user.authority[item])
            return false;
    }
    return true;
};

var authConfig = {
    'login': {
        key: 'login',
        errCode: 'NO_LOGIN',
    },
    'admin': {
        key: 'admin',
        errCode: 'NO_PERMISSIONS',
    },
    'dev': {
        key: 'dev',
        errCode: 'DEV',
    }
};

var authorityCheck = function (user, authList) {
    var noPermission = true;
    var desc = '';
    var errCode = '';
    var notPassAuth = null;
    if (!authList || !authList.length) {
        noPermission = false;
    } else {
        if (user && user.authority) {
            noPermission = false;
            for (var i in authList) {
                var key = authList[i];
                var checkAuth = authConfig[key];
                if (!checkAuth || !checkAuth.key)
                    throw common.error('no auth [' + key + ']!', 'CODE_ERROR');
                if (!auth.isHadAuthority(user, checkAuth.key)) {
                    notPassAuth = checkAuth;
                    break;
                }
            }
        } else {
            notPassAuth = authList[0];
        }
        if (notPassAuth) {
            errCode = notPassAuth.errCode;
            noPermission = true;
        }
    }
    return {noPermission: noPermission, errCode: errCode};
}