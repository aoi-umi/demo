/**
 * Created by umi on 2017-5-29.
 */
var _ = require('underscore');
var common = require('./common');
var errorConfig = require('./errorConfig');
var auth = exports;
exports.auth = function (req, res, next) {
    //url权限认证
    var user = req.myData.user;
    var pathname = req._parsedUrl.pathname;
    var accessableUrl = req.myData.accessableUrl = auth.getAccessableUrl(user, pathname);
    next();
};

exports.isHadAuthority = function (user, authData) {
    if (typeof authData == 'string')
        authData = authData.split(',');
    for (var i = 0; i < authData.length; i++) {
        var item = authData[i];
        if (!user.authority[item])
            return false;
    }
    return true;
};

exports.isExistAuthority = function (user, authData) {
    if (typeof authData == 'string')
        authData = authData.split(',');
    for (var i = 0; i < authData.length; i++) {
        var item = authData[i];
        if (user.authority[item])
            return true;
    }
    return false;
};

var authConfig = {
    'login': {
        errCode: 'NO_LOGIN',
    },
    'accessable': {
        errCode: 'NO_PERMISSIONS',
    },
    'admin': {
        errCode: 'NO_PERMISSIONS',
    },
    'dev': {
        errCode: 'DEV',
    }
};

exports.getAccessableUrl = function (user, pathname) {
    var urlList = [];
    var argList = [{
        //不检查
        list: [
            '/',
            '/msg',
            '/sign/up',
            '/sign/in',
            '/sign/out',

            '/mainContent/list',
            '/mainContent/query',
            '/mainContent/detail',

            '/mainContentType/list',
            '/mainContentType/query',
            '/mainContentType/detailQuery',
        ],
        auth: '',
        errorCode: authConfig.accessable.errCode
    }, {
        //本地
        list: [
            '/log/save'
        ],
        auth: 'local',
        errorCode: authConfig.accessable.errCode
    }, {
        //开发
        list: [
            '/log',
            '/log/query',
            '/help',
            '/status',
            '/color',
        ],
        auth: 'dev',
        errorCode: authConfig.dev.errCode
    }, {
        //admin
        list: [
            '/mainContent/del',
            '/mainContentType/del',
        ],
        auth: 'admin',
        errorCode: authConfig.admin.errCode
    }, {
        //login
        list: [
            '/mainContent/save',
            '/mainContent/statusUpdate',

            '/mainContentType/save',
        ],
        auth: 'login',
        errorCode: authConfig.login.errCode
    }];

    var accessable = false;
    argList.forEach(function (item) {
        var isHadAuthority = !item.auth || auth.isHadAuthority(user, item.auth);
        var isInArray = common.isInArray(pathname, item.list);
        if (isHadAuthority) {
            urlList = urlList.concat(item.list);
            if (isInArray)
                accessable = true;
        } else if (isInArray)
            throw common.error('', item.errorCode);
    });
    if (!accessable)
        throw common.error('', authConfig.accessable.errCode);
    return urlList;
};