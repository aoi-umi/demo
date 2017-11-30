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
        if (!auth.isExistAuthority(user, item, opt))
            return false;
    }
    return true;
};

exports.isExistAuthority = function (user, authData, opt) {
    var result = false;
    if (typeof authData == 'string')
        authData = authData.split(',');
    for (var i = 0; i < authData.length; i++) {
        var item = authData[i];
        if (user.authority[item]) {
            if (opt) opt.notExistAuthority = null;
            result = true;
            return result;
        }
        if (opt) {
            opt.notExistAuthority = item;
        }
    }
    return result;
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
        {url: '/interface/upload'},
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

        {url: '/userInfo/detail', auth: ['login']},
        {url: '/interface/userInfo/save', auth: ['login']},

        {url: '/mainContent/list'},
        {url: '/mainContent/detail'},
        {url: '/interface/mainContent/query'},
        {url: '/interface/mainContent/save', auth: ['login']},
        {url: '/interface/mainContent/statusUpdate', auth: ['login']},
        {url: '/interface/mainContent/del', auth: ['admin']},

        {url: '/mainContentType/list'},
        {url: '/interface/mainContentType/query'},
        {url: '/interface/mainContentType/detailQuery'},
        {url: '/interface/mainContentType/save', auth: ['login']},
        {url: '/interface/mainContentType/del', auth: ['admin']},
    ];

    var accessable = false;
    argList.forEach(function (item) {
        var opt = {notExistAuthority: null};
        var isHadAuthority = !item.auth || auth.isHadAuthority(user, item.auth, opt);
        var isExist = item.url == pathname;
        if (isHadAuthority) {
            url[item.url] = true;
            if (isExist)
                accessable = true;
        } else if (isExist) {
            var errCode = authConfig.accessable.errCode;
            if (opt.notExistAuthority && authConfig[opt.notExistAuthority])
                errCode = authConfig[opt.notExistAuthority].errCode;
            throw common.error('', errCode);
        }
    });
    if (!accessable)
        throw common.error('', authConfig.accessable.errCode);
    return url;
}
;