/**
 * Created by bang on 2017-9-7.
 */
var path = require('path');
var fs = require('fs');
var common = require('../_system/common');
var auth = require('../_system/auth');
var myEnum = require('../_system/enum');
var main = require('../_system/_main');
var autoBll = require('../bll/_auto');

exports.get = function (req, res, next) {
    var pathname = req._parsedUrl.pathname;
    var opt = {
        view: pathname,
        user: req.myData.user,
    }
    //console.log(req.originalUrl, req._parsedUrl.pathname)
    switch (pathname) {
        case '/':
            opt.view = '/index';
            break;
    }

    var moduleViewPath = path.join(req.myData.viewPath, 'module', opt.view + '.ejs');
    var isExist = fs.existsSync(moduleViewPath);
    if (!isExist)
        return next();

    common.promise().then(function () {
        return setViewOption(req, opt);
    }).then(function () {
        res.myRender('view', opt);
    }).fail(function (e) {
        next(e);
    });
};

var setViewOption = function (req, opt) {
    var query = req.query;
    var user = req.myData.user;
    switch (opt.view) {
        case '/status':
            opt.enumDict = main.enumDict;
            opt.enumChangeDict = main.enumChangeDict;
            break;

        case '/userInfo/detail':
            var userInfoId = user.id;
            if (query.id && query.id != userInfoId) {
                auth.isHadAuthority(user, 'admin', {throwError: true});
                userInfoId = query.id;
            }
            return autoBll.custom('userInfo', 'detailQuery', {id: userInfoId}).then(function (t) {
                opt.userInfoDetail = t;
            });
            break;

        case '/mainContent/list':
            opt.mainContentStatusEnum = myEnum.getEnum('mainContentStatusEnum');
            opt.mainContentTypeEnum = myEnum.getEnum('mainContentTypeEnum');
            break;
        case '/mainContent/detail':
            return require('./mainContent').detailQuery({id: query.id}, opt);
            break;
    }
};