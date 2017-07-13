/**
 * Created by umi on 2017-5-29.
 */
var request = require('request');
var net = require('net');
var config = require('../../config');
var common = exports;

exports.extend = function() {
    var args = arguments;
    var res;
    for (var i in args) {
        var arg = args[i];
        if (typeof(arg) == 'object') {
            if (!res) res = arg;
            else {
                for (var key in  arg) {
                    if (arg[key] != undefined)
                        res[key] = arg[key];
                }
            }
        }
    }
    return res;
}

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
            body: option.data,
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

exports.requestService = function (opt, cb) {
    if(!opt.method)
        opt.method = 'POST';
    if(opt.json == undefined)
        opt.json = true;
    request(opt, function(err, res, data) {
        cb(err, data);
        if(err)
            console.error(opt);
    });
};

exports.formatRes = function (err, data) {
    //result    是否成功
    //desc      描述
    //detail    成功 返回的内容
    //          失败 错误代码
    var res = {
        result: null,
        detail: null,
        desc: null,
    };
    if(err) {
        common.writeError(err);
        if(err.message) err = err.message;
        res.result = false;
        res.desc = err;
    }else{
        res.result = true;
        res.desc = 'success';
    }
    if(data)
        res.detail = data;
    return res;
};

exports.formatViewtRes = function(opt){
    if(!opt)
        opt = {};
    opt.version = config.version;
    return opt;
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

exports.dateFormat = function (date, format) {
    try {
        if (!format)format = 'yyyy-MM-dd';
        if(!date)
            date = new Date();
        if(typeof date == 'string')
            date = Date.parse(date);


        var o = {
            y: date.getFullYear(),
            M: date.getMonth() + 1,
            d: date.getDate(),
            h: date.getHours() % 12,
            H: date.getHours(),
            m: date.getMinutes(),
            s: date.getSeconds()
        };
        return format.replace(/(y+|M+|d+|h+|H+|m+|s+)/g, function (e) {
            return ((e.length > 1 ? '0' : '') + eval('o.' + e.slice(-1))).slice(-(e.length > 2 ? e.length : 2))
        });
    } catch (ex) {
        return '';
    }
};
//console.log(exports.dateFormat(null,'yyyy-MM-dd hh:mm:ss'))
//console.log(exports.dateFormat(null,'yyyy-MM-dd H:mm:ss'))
