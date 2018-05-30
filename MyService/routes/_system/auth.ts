/**
 * Created by umi on 2017-5-29.
 */
import * as common from './common';
import errorConfig from './errorConfig';

var authConfig = {
    'dev': {
        errCode: errorConfig.DEV,
    },
    'local': {
        errCode: errorConfig.NO_PERMISSIONS,
    },
    'login': {
        errCode: errorConfig.NO_LOGIN,
    },
    'accessable': {
        errCode: errorConfig.NO_PERMISSIONS,
    },
    'admin': {
        errCode: errorConfig.NO_PERMISSIONS,
    },
};

export let accessableUrlConfig = [];

export let init = function (opt) {
    accessableUrlConfig = opt.accessableUrlConfig;
};

export let check = function (req, res, next) {
    //url权限认证
    var user = req.myData.user;
    var pathname = req._parsedUrl.pathname;
    req.myData.accessableUrl = getAccessableUrl(user, pathname);
    next();
};

export let isHadAuthority = function (user, authData, opt?) {
    if (typeof authData == 'string')
        authData = [authData];
    for (var i = 0; i < authData.length; i++) {
        var item = authData[i];
        if (!isExistAuthority(user, item, opt)) {
            return false;
        }
    }
    return true;
};

export let isExistAuthority = function (user, authData, opt) {
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
        throw common.error('', getErrorCode(opt.notExistAuthority));
    }
    return false;
};

//获取可访问的url，如传入pathname，该路径不可访问时抛出错误
export let getAccessableUrl = function (user, pathname) {
    var url = {};
    var accessable = false;
    var isUrlExist = false;
    accessableUrlConfig.forEach(function (item) {
        var opt = { notExistAuthority: null };
        var result = !item.auth || !item.auth.length || isHadAuthority(user, item.auth, opt);
        var isExist = item.url == pathname;
        if (isExist) isUrlExist = true;
        if (result) {
            url[item.url] = true;
            if (isExist)
                accessable = true;
        } else if (isExist) {
            var errCode = getErrorCode(opt.notExistAuthority);
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

export let getErrorCode = function (authData) {
    if (authData && authConfig[authData] && authConfig[authData].errCode)
        return authConfig[authData].errCode;
    return errorConfig.NO_PERMISSIONS;
};