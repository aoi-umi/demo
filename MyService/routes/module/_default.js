/**
 * Created by bang on 2017-9-7.
 */
var path = require('path');
var fs = require('fs');
var common = require('../_system/common');
var myEnum = require('./../_system/enum');
var autoBll = require('../_bll/auto');

//module post 接口
exports.default = function (req, res, next) {
    var bll = getBll(req, res, next);
    if(!bll)
        return next();
    common.promise().then(function () {
        return bll;
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
    switch (method) {
        case 'save':
        case 'del':
        case 'query':
        case 'detailQuery':
            break;
        default:
            throw common.error('no match method[' + method + ']', 'BAD_REQUEST');
    }
    var opt = {
        isUsedCustom: false
    };
    //使用custom
    if((module == 'log' && common.isInArray(method, ['query']))
        || (module == 'main_content_type' && common.isInArray(method, ['save']))
        || (module == 'main_content' && common.isInArray(method, ['query','save']))
    ) {
        opt.isUsedCustom = true;
    }
    if(common.isInArray(method, ['detailQuery'])){
        if(!args || !args.id)
            throw common.error('args error');
    }

    //不记录日志
    if(module == 'log'){
        req.myData.noLog = true;
    }

    if(opt.isUsedCustom){
        return autoBll.custom(module, method, args);
    }else {
        var modulePath = path.resolve(__dirname + '/../_dal/' + module + '_auto.js');
        var isExist = fs.existsSync(modulePath);
        if(!isExist){
            return null;
        }
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
            case '/mainContentDetail':
                return autoBll.custom('main_content', 'detailQuery', {id: query.id}).then(function (t) {
                    opt.mainContentDetail = t;
                });
                break;
        }
    }).then(function(){
        res.myRender('view', opt);
    }).fail(function(e){
        next(e);
    });
};