/**
 * Created by umi on 2017-5-29.
 */
var common = require('./common');
var errorConfig = require('./errorConfig');
var auth = exports;

var authConfig = {
    'dev': {
        errCode: 'DEV',
    },
    'local': {
        errCode: 'NO_PERMISSIONS',
    },
    'login': {
        errCode: 'NO_LOGIN',
    },
    'accessable': {
        errCode: 'NO_PERMISSIONS',
    },
    'admin': {
        errCode: 'NO_PERMISSIONS',
    },
};

exports.accessableUrlConfig = [];

exports.init = function (opt) {
    auth.accessableUrlConfig = opt.accessableUrlConfig;
};

exports.check = function (req, res, next) {
    //url权限认证
    var user = req.myData.user;
    var pathname = req._parsedUrl.pathname;
    req.myData.accessableUrl = auth.getAccessableUrl(user, pathname);
    next();
};

exports.isHadAuthority = function (user, authData, opt) {
    if (typeof authData == 'string')
        authData = [authData];
    for (var i = 0; i < authData.length; i++) {
        var item = authData[i];
        if (!auth.isExistAuthority(user, item, opt)) {
            return false;
        }
    }
    return true;
};

exports.isExistAuthority = function (user, authData, opt) {
    if (typeof authData == 'string')
        authData = authData.split(',');
    for (var i = 0; i < authData.length; i++) {
        var item = authData[i];
        if (user.authority[item]) {
            if (opt) opt.notExistAuthority = null;
            return true;
        }
        if (opt) {
            opt.notExistAuthority = item;
        }
    }
    if (opt && opt.throwError) {
        throw common.error('', auth.getErrorCode(opt.notExistAuthority));
    }
    return false;
};

//获取可访问的url，如传入pathname，该路径不可访问时抛出错误
exports.getAccessableUrl = function (user, pathname) {
    var url = {};
    var accessable = false;
    var isUrlExist = false;
    auth.accessableUrlConfig.forEach(function (item) {
        var opt = {notExistAuthority: null};
        var isHadAuthority = !item.auth || !item.auth.length || auth.isHadAuthority(user, item.auth, opt);
        var isExist = item.url == pathname;
        if (isExist) isUrlExist = true;
        if (isHadAuthority) {
            url[item.url] = true;
            if (isExist)
                accessable = true;
        } else if (isExist) {
            var errCode = authConfig.accessable.errCode;
            if (opt.notExistAuthority)
                errCode = auth.getErrorCode(opt.notExistAuthority);
            throw common.error('', errCode);
        }
    });
    if (pathname) {
        if (!isUrlExist)
            throw common.error('', errorConfig.NOT_FOUND);
        if (!accessable)
            throw common.error('', authConfig.accessable.errCode);
    }
    return url;
};

exports.getErrorCode = function (authData) {
    if (authConfig[authData] && authConfig[authData].errCode)
        return authConfig[authData].errCode;
    return 'NO_PERMISSIONS';
};