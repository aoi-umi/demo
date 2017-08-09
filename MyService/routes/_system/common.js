/**
 * Created by umi on 2017-5-29.
 */
var fs = require("fs");
var path = require('path');
var request = require('request');
var net = require('net');
var crypto = require('crypto');
var q = require('q');
var config = require('../../config');
var errorConfig = require('./errorConfig');
var myEnum = require('./enum');
var common = exports;

exports.extend = function () {
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
};

//带参数：args0:对象
//        args1:带nodeCallback的 function名
//        args2:function的参数1
//        args3:function的参数2
//        ...
exports.promise = function(obj, methodName){
    var args = arguments;
    var defer = q.defer();
    if(!args.length) {
        // var res = q.defer();
        // defer.promise.then(function () {
        //     return res.promise;
        // });
        // defer.resolve(res.resolve, res.reject);
        defer.resolve();
    }else{
       var funArgs = [];
       var evalStr = 'obj[methodName](';
       for (var key in args) {
           if(key != 0 && key != 1)
               funArgs.push('args[' + key + ']');
       }
       var cbStrList = [];
       cbStrList.push('function(){');
       cbStrList.push('	var cbArgs = arguments;');
       cbStrList.push('	if(cbArgs && cbArgs[0])');
       cbStrList.push('		defer.reject (cbArgs[0]);');
       cbStrList.push('	else{');
       cbStrList.push('		var resovleEval = \'defer.resolve (\';');
       cbStrList.push('		var resolveArgs = [];');
       cbStrList.push('		if(cbArgs){');
       cbStrList.push('			for(var cbArgKey in cbArgs){');
       cbStrList.push('				if(cbArgKey != 0){');
       cbStrList.push('					resolveArgs.push(\'cbArgs[\' + cbArgKey + \']\');');
       cbStrList.push('				}');
       cbStrList.push('			}');
       cbStrList.push('			if(resolveArgs.length)');
       cbStrList.push('				resovleEval += resolveArgs.join(\',\');');
       cbStrList.push('		}');
       cbStrList.push('		resovleEval	+= \')\';');
       cbStrList.push('		eval(resovleEval);');
       cbStrList.push('	}');
       cbStrList.push('}');
       funArgs.push(cbStrList.join('\n'));
       if (funArgs.length) evalStr += funArgs.join(',');
       evalStr += ');';
       eval(evalStr);
    }
    return defer.promise;
};

exports.promisify = function (fun) {
    return function () {
        var args = arguments;
        var evalStr = 'fun(';
        var funArgs = [];
        for (var key in args) {
            funArgs.push('args[' + key + ']');
        }
        var cbStrList = [];
        cbStrList.push('function(){');
        cbStrList.push('	var cbArgs = arguments;');
        //cbStrList.push('	console.log(cbArgs)');
        cbStrList.push('	if(cbArgs && cbArgs[0])');
        cbStrList.push('		return res.reject(cbArgs[0]);');
        cbStrList.push('	return res.resolve(cbArgs[1]);');
        cbStrList.push('}');
        funArgs.push(cbStrList.join('\n'));

        if (funArgs.length) evalStr += funArgs.join(',');
        evalStr += ');';
        return common.promise().then(function () {
            //console.log(evalStr);
            var res = q.defer();
            eval(evalStr);
            return res.promise;
        });
    };
};

exports.promisifyAll = function (obj) {
    for (var key in obj) {
        if (typeof obj[key] == 'function')
            obj[key + 'Promise'] = common.promisify(obj[key]);
    }
};

exports.requestServiceByConfig = function (option, cb) {
    try {
        var errStr = 'service "' + option.serviceName + '"';
        var service = config.api[option.serviceName];
        if (!service) throw common.error(errStr + ' is not exist!');
        var serviceArgs = null;

        var defaultMethodArgs = {
            isUseDefault: true,
        }
        var methodArgs = service[option.methodName];
        methodArgs = common.extend(defaultMethodArgs, methodArgs);
        //console.log(methodArgs);
        if (methodArgs.isUseDefault) {
            serviceArgs = service.defaultArgs;
        }
        else {
            serviceArgs = methodArgs.args;
        }
        if (!serviceArgs) throw common.error(errStr + ' args is empty!');

        var host = serviceArgs.host;
        if (!host) throw common.error(errStr + ' host is empty!');

        var method = methodArgs.method;
        var url = methodArgs.url;
        if (!url) throw common.error(errStr + ' method "' + option.methodName + '" url is empty!');
        url = host + url;
        var opt = {
            url: url,
            body: option.data,
            method: method
        };
        if (option.beforeSend) {
            //发送的参数 当前所用参数
            option.beforeSend(opt, serviceArgs);
        }
        common.requestServicePromise(opt).then(function (t) {
            cb(null, t);
        }).fail(function (e) {
            console.log('request', '[' + option.serviceName + ']', '[' + option.methodName + ']', 'error');
            console.log('url:', url);
            cb(e);
        });
    }
    catch (e) {
        cb(e);
    }
};

exports.requestService = function (option, cb) {
    var opt = {
        method: 'POST',
        json: true,
    };
    opt = common.extend(opt, option);
    //console.log(opt)
    request(opt, function (err, res, data) {
        cb(err, data);
        if (err)
            console.error(opt);
    });
};

exports.requestServiceByConfigPromise = common.promisify(exports.requestServiceByConfig);
exports.requestServicePromise = common.promisify(exports.requestService);

exports.formatRes = function (err, detail, desc) {
    //result    是否成功
    //desc      描述
    //detail    成功 返回的内容
    //          失败 错误代码
    var res = {
        result: null,
        detail: null,
        desc: null,
    };
    if (err) {
        common.writeError(err);
        if (err.message) err = err.message;
        res.result = false;
        res.desc = err;
    } else {
        res.result = true;
        res.desc = desc || 'success';
    }
    if (detail)
        res.detail = detail;
    return res;
};

exports.formatViewtRes = function (option) {
    var  opt = {
        title: 'TestService',
        version: config.version,
        user: null
    };
    opt = common.extend(opt, option);
    return opt;
};

exports.error = function (msg, code, option) {
    var opt = {
        sourceName: '',
        lang: 'zh',
        format: null,
    };
    if (option)
        opt = common.extend(opt, option);
    if (!code)
        code = '';

    if (code && errorConfig[code]) {
        var error = errorConfig[code];
        code = error.code;
        if (!msg) {
            msg = error.desc[opt.lang];
            if(typeof opt.format == 'function')
                msg = opt.format(msg);
        }
    }
    if(!msg) msg = '';
    var err = new Error(msg);
    err.code = code;
    return err;
};

exports.writeError = function (err) {
    console.error(err);

    var list = [];
    var createDate = common.dateFormat(new Date(), 'yyyy-MM-dd');
    var createDateTime = common.dateFormat(new Date(), 'yyyy-MM-dd HH:mm:ss');
    list.push(createDateTime);
    list.push(err);
    //用于查找上一级调用
    var stack = new Error().stack;
    var stackList = common.getStack(err.stack, 1, 4)
        .concat(['help stack:'])
        .concat(common.getStack(stack, 2, 4));
    for (var i = 0; i < stackList.length; i++) {
        console.error(stackList[i]);
        list.push(stackList[i]);
    }

    //write file
    common.mkdirsSync(config.errorDir);
    var fileName = config.errorDir + '/' + createDate + '.txt';
    fs.appendFile(fileName, list.join('\r\n') + '\r\n\r\n', function(){});
};

exports.getStack = function (stack, start, end) {
    var stackList = [];
    if (stack) stackList = stack.split('\n');
    return stackList.slice(start, end);
};

exports.mkdirsSync = function(dirname, mode) {
    if (fs.existsSync(dirname)) {
        return true;
    } else {
        if (common.mkdirsSync(path.dirname(dirname), mode)) {
            fs.mkdirSync(dirname, mode);
            return true;
        } else {
            return false;
        }
    }
}

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
        if (!convert) {
            ip = '::ffff:' + ip;
        } else {
            //转为2进制的数，每4位为一组，转换成16进制的
            //192.168.1.1  11000000 10101000 00000001 00000001  C0 A8 01 01 0:0:0:0:0:0:C0A8:0101  ::C0A8:0101
            var ipv6 = [];
            var list = ip.split('.');
            for (var i = 0; i < list.length; i++) {
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
            for (var i = 0; i < ipv6.length; i++) {
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

exports.format = function () {
    var res = '';
    var args = arguments;
    if (args) {
        res = args[0] || '';
        for (var key in args) {
            if (key != 0) {
                var reg = new RegExp('\\{' + (key - 1) + '\\}', 'g');
                res = res.replace(reg, args[key]);
            }
        }
        res = res.replace(/\{\d\}/g, '');
    }
    return res;
};

exports.dateFormat = function (date, format) {
    try {
        if (!format)format = 'yyyy-MM-dd';
        if (!date)
            date = new Date();
        if (typeof date == 'string')
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

exports.isInList = function (list, obj) {
    var result = false;
    if (list) {
        list.forEach(function (t) {
            if (t === obj) {
                result = true;
                return false;
            }
        });
    }
    return result;
};

exports.createToken = function (str) {
    var code = common.md5(str);
    return code;
};

exports.md5 = function (str, method) {
    var buff = new Buffer(str, 'utf8');
    var md5 = crypto.createHash('md5');
    if (!method)
        method = 'hex';
    var code = md5.update(buff).digest(method);
    return code;
};

function s4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
};

exports.guid = function () {
    return (s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4());
};

//状态变更
exports.enumCheck = function(srcEnum, destEnum, enumType) {
    if (enumType == undefined)
        throw new Error('enumType can not be empty!');
    var srcEnumList = [];
    var destEnumList = [];
    //  目标
    //源
    var list = null;

    var matchEnum = myEnum.getEnum(enumType);
    for(var key in matchEnum){
        srcEnumList.push(key);
        destEnumList.push(key);
    }
    list = myEnum.enumCheck[enumType];
    srcEnum = srcEnum.toString();
    destEnum = destEnum.toString();
    var indexSrcEnum = srcEnumList.indexOf(srcEnum);
    if (indexSrcEnum < 0)
        throw new Error('no match src enum!');
    var indexDestEnum = destEnumList.indexOf(destEnum);
    if (indexDestEnum < 0)
        throw new Error('no match dest enum!');

    if (!list[indexSrcEnum][indexDestEnum]) {
        throw common.error(null, errorConfig.ENUM_CHANGED_INVALID.code, {
            //lang:'en',
            format: function (msg) {
                return common.format(msg,
                    enumType + ':[' + srcEnum + '](' + myEnum.getValue(enumType, srcEnum) + ')',
                    '[' + destEnum + '](' + myEnum.getValue(enumType, destEnum) + ')');
            }
        });
    }
};

//common.enumCheck(1,0,'statusEnum');