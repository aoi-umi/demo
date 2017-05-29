/**
 * Created by umi on 2017-5-29.
 */
var request = require('request');
var colors = require('colors');
var config = require('../../config');
var common = exports;
exports.requestServiceFromConfig = function (option, cb) {
    try {
        var errStr = 'service "' + option.serviceName + '"';
        var service = config.api[option.serviceName];
        if(!service) throw new Error(errStr + ' is not exist!');
        var host = service.host;
        var method = service[option.method];
        if(!host) throw new Error(errStr + ' host is empty!');
        if(!method) throw new Error(errStr + ' method "' + option.method + '" is empty!');
        var url = host + method;
        var opt = {
            url: url,
            data: option.data,
        };
        //console.log(opt);
        common.requestService(opt, cb);
    }
    catch (e) {
        cb(e.message);
        common.writeError(e);
    }
}
exports.requestService = function (option, cb) {
    var opt = option;
    var options = {
        headers: {},
        url: opt.url,
        method: 'POST',
        json: true,
        body: opt.data
    };
    request(options, function(err, res, data) {
        cb(err, data);
    });
}

exports.formatReq = function (err, data, result) {
    var res = {
        code: null,
        detail: null,
        desc: null,
    };
    if(err) {
        res.code = '400';
        res.desc = err;
    }else{
        res.code = '20000';
        res.detail = data;
    }
    if(result) res.code = result;
    return res;
}

exports.writeError = function (err){
    console.error(err)
    //用于查找上一级调用
    var stack = new Error().stack;
    var stackList = common.getStack(stack, 2, 3).concat(common.getStack(err.stack, 1, 3))
    for(var i = 0;i < stackList.length; i++){
        console.error(stackList[i]);
    };
}

exports.getStack = function (stack, start, end) {
    var stackList = [];
    if(stack) stackList = stack.split('\n');
    return stackList.slice(start, end);
}