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

exports.getAccessableUrl = function (user, pathname) {
    var url = {};
    var argList = [
        {url: '/'},
        {url: '/msg'},
        {url: '/interface/upload', auth: ['login']},
        {url: '/help', auth: ['dev']},
        {url: '/status', auth: ['dev']},
        {url: '/color', auth: ['dev']},

        {url: '/log', auth: ['dev']},
        {url: '/interface/log/query', auth: ['dev']},
        {url: '/interface/log/save', auth: ['local']},

        {url: '/sign/up'},
        {url: '/sign/in'},
        {url: '/interface/sign/up'},
        {url: '/interface/sign/in'},
        {url: '/interface/sign/out'},

        //角色
        {url: '/role/list', auth: ['admin']},
        {url: '/interface/role/query', auth: ['admin']},
        {url: '/interface/role/save', auth: ['admin']},
        {url: '/interface/role/detailQuery', auth: ['admin']},

        //权限
        {url: '/authority/list', auth: ['admin']},
        {url: '/interface/authority/query', auth: ['admin']},
        {url: '/interface/authority/save', auth: ['admin']},
        {url: '/interface/authority/detailQuery', auth: ['admin']},

        //用户信息
        {url: '/userInfo/detail', auth: ['login']},
        {url: '/userInfo/list', auth: ['admin']},
        {url: '/interface/userInfo/query', auth: ['admin']},
        {url: '/interface/userInfo/detailQuery', auth: ['admin']},
        {url: '/interface/userInfo/save', auth: ['login']},
        {url: '/interface/userInfo/adminSave', auth: ['admin']},

        {url: '/mainContent/list', auth: ['mainContentQuery']},
        {url: '/mainContent/detail', auth: ['mainContentQuery']},
        {url: '/interface/mainContent/query', auth: ['mainContentQuery']},
        {url: '/interface/mainContent/save', auth: ['mainContentSave']},
        {url: '/interface/mainContent/statusUpdate', auth: ['mainContentSave']},
        //{url: '/interface/mainContent/del', auth: ['admin']},

        {url: '/mainContentType/list', auth: ['mainContentTypeQuery']},
        {url: '/interface/mainContentType/query', auth: ['mainContentTypeQuery']},
        {url: '/interface/mainContentType/detailQuery', auth: ['mainContentTypeDetailQuery']},
        {url: '/interface/mainContentType/save', auth: ['mainContentTypeSave']},
        {url: '/interface/mainContentType/del', auth: ['mainContentTypeDel']},
    ];

    var accessable = false;
    var isUrlExist = false;
    argList.forEach(function (item) {
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
    if (!isUrlExist)
        throw common.error('', errorConfig.NOT_FOUND.code);
    if (!accessable)
        throw common.error('', authConfig.accessable.errCode);
    return url;
};

exports.getErrorCode = function (authData) {
    if (authConfig[authData] && authConfig[authData].errCode)
        return authConfig[authData].errCode;
    return 'NO_PERMISSIONS';
};