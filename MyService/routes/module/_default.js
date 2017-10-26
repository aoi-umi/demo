/**
 * Created by bang on 2017-9-7.
 */
var path = require('path');
var fs = require('fs');
var common = require('../_system/common');
var autoBll = require('../_bll/auto');

exports.post = function (req, res, next) {
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
    if((module == 'log' && common.isInList(['query'], method))
    || (module == 'main_content_type' && common.isInList(['save'], method))
    ) {
        opt.isUsedCustom = true;
    }
    if(common.isInList(['detailQuery'], method)){
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
        var modulePath = path.resolve(__dirname + '/../_bll/' + module + '.js');
        var isExist = fs.existsSync(modulePath);
        if(!isExist){
            return null;
        }
        return autoBll[method](module, args);
    }
}