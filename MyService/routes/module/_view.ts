/**
 * Created by bang on 2017-9-7.
 */
import * as path from 'path';
import * as fs from 'fs';
import * as common from '../_system/common';
import * as auth from '../_system/auth';
import * as myEnum from '../_system/enum';
import * as main from '../_main';
import * as autoBll from '../bll/_auto';

export let get = function (req, res, next) {
    var pathname = req._parsedUrl.pathname;
    var opt = {
        view: pathname,
        user: req.myData.user,
        req: req,
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

    common.promise(function () {
        return setViewOption(opt);
    }).then(function () {
        res.myRender('view', opt);
    }).fail(function (e) {
        next(e);
    });
};

var setViewOption = function (opt) {
    let req = opt.req;
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
                auth.isHadAuthority(user, 'admin', { throwError: true });
                userInfoId = query.id;
            }
            return require('../viewBll/userInfo').detailQuery({ id: userInfoId }, opt);

        case '/mainContent/list':
            opt.mainContentStatusEnum = myEnum.getEnum('mainContentStatusEnum');
            opt.mainContentTypeEnum = myEnum.getEnum('mainContentTypeEnum');
            break;
        case '/mainContent/detail':
            return require('../viewBll/mainContent').detailQuery({ id: query.id }, opt);

    }
};