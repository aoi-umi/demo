/**
 * Created by bang on 2017-9-7.
 */
var path = require('path');
var fs = require('fs');
var common = require('../_system/common');
var myEnum = require('./../_system/enum');
var autoBll = require('../_bll/auto');
var errorConfig = require('../_system/errorConfig');

//module post 接口
exports.default = function (req, res, next) {
    common.promise().then(function () {
        return getBll(req, res, next);
    }).then(function (t) {
        res.mySend(null, t);
    }).fail(function (e) {
        res.mySend(e);
    });
};

function getBll(req, res, next){
    var params = req.params;
    var args = req.body;
    var module = params.module;
    var method = params.method;
    console.log(`[module:${module}][method:${method}]`);
    var opt = {
        isUsedCustom: false
    };
    //使用custom
    if((module == 'log' && common.isInArray(method, ['query']))
        || (module == 'mainContentType' && common.isInArray(method, ['save']))
        || (module == 'mainContent' && common.isInArray(method, ['query','save','statusUpdate']))
    ) {
        opt.isUsedCustom = true;
    }
    if(common.isInArray(method, ['detailQuery'])){
        if(!args || !args.id)
            throw common.error('args error');
    }

    //不记录日志
    if(common.isInArray(module, ['log'])){
        req.myData.noLog = true;
    }

    //转换为小写下划线;
    module = common.stringToLowerCaseWithUnderscore(module);
    if(opt.isUsedCustom){
        return autoBll.custom(module, method, args);
    }else {
        var modulePath = path.resolve(__dirname + '/../_dal/' + module + '_auto.js');
        var isExist = fs.existsSync(modulePath);
        if (!isExist)
            throw common.error('file is not exist', errorConfig.BAD_REQUEST.code);
        if (!autoBll[method])
            throw common.error(`method[${method}] is not exist`, errorConfig.BAD_REQUEST.code);
        return autoBll[method](module, args);
    }
}

//页面 get
exports.view = function (req, res, next) {
    var opt = {
        view: '/index',
    }
    //console.log(req.originalUrl, req._parsedUrl.pathname)
    switch (req._parsedUrl.pathname) {
        case '/':
            opt.method = 'get';
            break;
        default:
            opt.view = req._parsedUrl.pathname;
            break;
    }

    var moduleViewPath = path.join(req.myData.viewPath, 'module', opt.view + '.ejs');
    var isExist = fs.existsSync(moduleViewPath);
    if (!isExist)
        return next();

    var query = req.query;
    common.promise().then(function(){
        switch (opt.view) {
            case '/status':
                opt.enumDict = myEnum.enumDict;
                opt.enumChangeDict = myEnum.enumChangeDict;
                break;
            case '/mainContent':
                opt.mainContentStatusEnum = myEnum.getEnum('main_content_status_enum');
                opt.mainContentTypeEnum = myEnum.getEnum('main_content_type_enum');
                break;
            case '/mainContentDetail':
                return require('./mainContent').detailQuery({id: query.id}, opt);
                break;
        }
    }).then(function(){
        res.myRender('view', opt);
    }).fail(function(e){
        next(e);
    });
};