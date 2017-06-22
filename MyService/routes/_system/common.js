/**
 * Created by umi on 2017-5-29.
 */
var request = require('request');
var config = require('../../config');
var net = require('net');
var common = exports;
exports.requestServiceByConfig = function (option, cb) {
    try {
        var errStr = 'service "' + option.serviceName + '"';
        var service = config.api[option.serviceName];
        if(!service) throw new Error(errStr + ' is not exist!');
        var serviceArgs = null;

        var methodArgs = service[option.methodName];
        if(methodArgs.isUseDefault !== false) {
            serviceArgs = service.defaultArgs;
        }
        else{
            serviceArgs = methodArgs.args;
        }
        if (!serviceArgs) throw new Error(errStr + ' args is empty!');

        var host = serviceArgs.host;
        if (!host) throw new Error(errStr + ' host is empty!');

        var method = methodArgs.method;
        var url = methodArgs.url;
        if(!url) throw new Error(errStr + ' method "' + option.methodName + '" url is empty!');
        url = host + url;
        var opt = {
            url: url,
            data: option.data,
            method: method
        };
        if(option.beforeSend){
            //发送的参数 当前所用参数
            option.beforeSend(opt, serviceArgs);
        }
        //console.log(opt);
        common.requestService(opt, function (err, data) {
            if(err) {
                console.log('request', '[' + option.serviceName + ']', '[' + option.methodName + ']', 'error');
                console.log('url:', url);
            }
            cb(err, data);
        });
    }
    catch (e) {
        cb(e);
    }
};

exports.requestService = function (option, cb) {
    var opt = option;
    var options = {
        headers: opt.header || {},
        url: opt.url,
        method: opt.method || 'POST',
        json: true,
        body: opt.data
    };
    request(options, function(err, res, data) {
        cb(err, data);
    });
};

exports.formatRes = function (err, data, result) {
    var res = {
        code: null,
        detail: null,
        desc: null,
    };
    if(err) {
        common.writeError(err);
        if(err.message) err = err.message;
        res.code = '400';
        res.desc = err;
    }else{
        res.code = '20000';
        res.detail = data;
    }
    if(result) res.code = result;
    return res;
};

exports.writeError = function (err){
    console.error(err)
    //用于查找上一级调用
    var stack = new Error().stack;
    var stackList = common.getStack(err.stack, 1,3)
        .concat(['help stack:'])
        .concat(common.getStack(stack, 2, 4));
    for(var i = 0;i < stackList.length; i++) {
        console.error(stackList[i]);
    }
};

exports.getStack = function (stack, start, end) {
    var stackList = [];
    if(stack) stackList = stack.split('\n');
    return stackList.slice(start, end);
};

exports.getClientIp = function (req) {
    // var ip = req.headers['x-forwarded-for']
    // || req.connection.remoteAddress
    // || req.socket.remoteAddress
    // || req.connection.socket.remoteAddress;
    var ip = req.ip;
    return ip;
};

exports.IPv4ToIPv6 = function (ip, convert) {
    if (net.isIPv4(ip)) {
        if(!convert) {
            ip = '::ffff:' + ip;
        }else{
            //转为2进制的数，每4位为一组，转换成16进制的
            //192.168.1.1  11000000 10101000 00000001 00000001  C0 A8 01 01 0:0:0:0:0:0:C0A8:0101  ::C0A8:0101
            var ipv6 = [];
            var list = ip.split('.');
            for(var i = 0; i <list.length;i++) {
                var t = parseInt(list[i]).toString(2);
                if (t.length % 8 != 0) {
                    var fixNum = 8 - t.length;
                    for (var j = 0; j < fixNum; j++) {
                        t = '0' + t;
                    }
                }
                ipv6.push(parseInt(t.substr(0, 4), 2).toString(16));
                ipv6.push(parseInt(t.substr(4, 4), 2).toString(16));
            }
            var ipv6List = [];
            var ipv6Str = '';
            for(var i = 0; i < ipv6.length;i++ ) {
                ipv6Str += ipv6[i];
                if ((i + 1) % 4 == 0 && ipv6Str) {
                    ipv6List.push(ipv6Str);
                    ipv6Str = '';
                }
            }
            ip = '::' + ipv6List.join(':');
        }
    }
    return ip;
};
// console.log(exports.IPv4ToIPv6('192.168.1.1'))
// console.log(exports.IPv4ToIPv6('192.168.1.1', true))
