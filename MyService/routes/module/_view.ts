/**
 * Created by bang on 2017-9-7.
 */
import * as path from 'path';
import * as fs from 'fs';
import {Request, Response} from 'express';

import * as common from '../_system/common';
import * as myEnum from '../_system/enum';
import * as main from '../_main';
import config from "../../config";

export let get = function (req: Request, res: Response, next) {
    req.myData.method.methodName = 'module-view';
    var pathname = req._parsedUrl.pathname;
    var opt = {
        view: pathname,
        user: req.myData.user,
        req: req,
    }
    //console.log(req.originalUrl, req._parsedUrl.pathname)

    common.promise(function () {
        return setViewOption(opt);
    }).then(function () {
        var moduleViewPath = path.join(req.myData.viewPath, 'module', opt.view + '.ejs');
        var isExist = fs.existsSync(moduleViewPath);
        if (!isExist)
            return next();
        res.myRender('view', opt);
    }).fail(function (e) {
        next(e);
    });
};

var setViewOption = function (opt) {
    let req = opt.req;
    var query = req.query;
    var user = opt.user;
    switch (opt.view) {
        case '/':
            opt.view = '/index';
            break;

        case '/status':
            opt.enumDict = main.enumDict;
            opt.enumChangeDict = main.enumChangeDict;
            break;

        case '/userInfo/detail':
            return require('../viewBll/userInfo').detailQuery({id: query.id || user.id}, opt);

        case '/mainContent/list':
            opt.mainContentStatusEnum = myEnum.getEnum('mainContentStatusEnum');
            opt.mainContentTypeEnum = myEnum.getEnum('mainContentTypeEnum');
            break;

        case '/mainContent/detail':
            return require('../viewBll/mainContent').detailQuery({id: query.id}, opt);

        case '/help':
            return require('../viewBll/help').get(null, opt);

        case '/systemInfo':
            opt.config = {};
            for (let key in config) {
                if (common.isInArray(key, ['name', 'port', 'deploy', 'version', 'env',
                        'errorDir', 'fileDir', 'cachePrefix',])) {
                    opt.config[key] = config[key];
                }
                opt.config.redis = `${config.redis.host}:${config.redis.port}`;
                opt.config.database = `${config.datebase.host}:${config.datebase.port}`;
                opt.config.api = {};
                for (let serviceName in config.api) {
                    opt.config.api[serviceName] = {};
                    for (let methodKey in config.api[serviceName].method) {
                        let methodConfig = config.api[serviceName].method[methodKey];
                        let methodArgs = common.clone(config.api[serviceName].defaultArgs);
                        if (!methodConfig.isUseDefault)
                            methodArgs = common.extend(methodArgs, methodConfig.args);
                        opt.config.api[serviceName][methodKey] = `${methodArgs.host}${methodConfig.url}`;
                    }
                }
            }
            break;

    }
};