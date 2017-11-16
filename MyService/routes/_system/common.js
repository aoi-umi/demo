/**
 * Created by umi on 2017-5-29.
 */
var fs = require('fs');
var path = require('path');
var request = require('request');
var net = require('net');
var crypto = require('crypto');
var q = require('q');
var zlib = require('zlib');
var config = require('../../config');
var errorConfig = require('./errorConfig');
var logService = require('../_service/logService');
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

exports.defer = function () {
    return q.defer();
}
//带参数：args0:对象
//        args1:带nodeCallback的 function名
//        args2:function的参数1
//        args3:function的参数2
//        ...
exports.promise = function (obj, methodName) {
    var args = arguments;
    var defer = q.defer();
    if (!args.length) {
        var res = q.defer();
        defer.resolve(res);
    } else {
        var funArgs = [];
        for (var key in args) {
            if (key != 0 && key != 1)
                funArgs.push(args[key]);
        }

        funArgs.push(function(err) {
            var cbArgs = arguments;
            if (err)
                defer.reject (err);
            else {
                var resolveArgs = [];
                for (var cbArgKey in cbArgs) {
                    if (cbArgKey != 0) {
                        resolveArgs.push(cbArgs[cbArgKey]);
                    }
                }
                defer.resolve.apply(void 0, resolveArgs);
            }
        });
        obj[methodName].apply(obj, funArgs);
    }
    return defer.promise;
};

exports.promisify = function (fun) {
    return function () {
        var args = [];
        for (var key in arguments) {
            args.push(arguments[key]);
        }
        return common.promise().then(function () {
            var res = q.defer();
            args.push(function(err, t) {
                if (err)
                    return res.reject(err);

                var cbArgs = [];
                for (var key in arguments) {
                    if(key != 0)
                        cbArgs.push(arguments[key]);
                }
                return res.resolve.apply(void 0, cbArgs);
            });
            fun.apply(void 0, args);
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

exports.requestServiceByConfigPromise = function (option) {
    var method = '';
    var url = '';
    var log = common.logModle();
    var startTime = new Date().getTime();
    return common.promise().then(function () {
        var errStr = 'service "' + option.serviceName + '"';
        var service = config.api[option.serviceName];
        if (!service) throw common.error(errStr + ' is not exist!');
        var serviceArgs = null;

        var defaultMethodArgs = {
            isUseDefault: true,
            method: 'POST',
        }
        var methodArgs = service.method[option.methodName];
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

        method = methodArgs.method;
        url = methodArgs.url;
        if (!url) throw common.error(errStr + ' method "' + option.methodName + '" url is empty!');
        url = host + url;
        var opt = {
            url: url,
            body: option.data,
            method: method
        };
        if (option.beforeRequest) {
            //发送的参数 当前所用参数
            option.beforeRequest(opt, serviceArgs);
        }
        log.guid = common.guid();
        log.url = url;
        log.req = opt.body;
        log.method = '[' + option.serviceName + '][' + option.methodName + ']';
        log.duration = startTime - new Date().getTime();
        return common.requestServicePromise(opt);
    }).then(function (t) {
        log.result = true;
        log.res = t;
        if (option.afterResponse) {
            t = option.afterResponse(t);
        }
        return t;
    }).fail(function (e) {
        log.result = false;
        log.res = e;
        console.log('request', log.method, 'error');
        console.log('url:', url);
        throw e;
    }).finally(function () {
        if (!option.noLog) {
            common.logSave(log);
        }
    });
};

exports.requestServicePromise = function (option) {
    var opt = {
        method: 'POST',
        json: true,
        encoding: null,
    };
    opt = common.extend(opt, option);
    //console.log(opt)
    return common.promise().then(function (res) {
        request(opt, function (err, response, data) {
            try {
                if (err)
                    throw err;
                var encoding = response.headers['content-encoding'];
                if (encoding) {
                    switch (encoding) {
                        case 'gzip':
                            return common.unzipPromise(data).then(function (buffer) {
                                data = buffer.toString();
                                if (data && typeof data == 'string')
                                    data = JSON.parse(data);
                                return res.resolve(data);
                            }).fail(function (e) {
                                return res.reject(e);
                            });
                            break;
                        default:
                            throw common.error('Not Accept Encoding');
                            break;
                    }
                }
                if (Buffer.isBuffer(data)) {
                    data = data.toString();
                }
                return res.resolve(data);
            } catch (e) {
                return res.reject(e);
                console.error(opt);
            }
        });
        return res.promise;
    }).fail(function (e) {
        throw e;
    });
};

exports.unzipPromise = common.promisify(zlib.unzip);

exports.formatRes = function (err, detail, opt) {
    //result    是否成功
    //detail    成功 返回的内容
    //          失败 错误详细
    //code      成功/失败代码
    //desc      描述
    var res = {
        result: null,
        detail: null,
        code: null,
        desc: null,
        guid: common.guid()
    };
    if (err && err.code)
        res.code = err.code;
    if (opt && opt.code)
        res.code = opt.code;
    if (opt && opt.desc)
        res.desc = opt.desc;
    if (err) {
        common.writeError(err);
        var errMsg = err;
        if (err.message) errMsg = err.message;
        res.result = false;
        res.desc = errMsg;
    } else {
        res.result = true;
        if (!res.desc)
            res.desc = 'success';
    }
    if (detail)
        res.detail = detail;
    return res;
};

exports.formatViewtRes = function (option) {
    var opt = {
        env: config.env,
        title: config.name,
        siteName: config.name,
        version: config.version,
        user: null,
        noNav: false,
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
            if (typeof opt.format == 'function')
                msg = opt.format(msg);
        }
    }
    if (!msg) msg = '';
    if (typeof msg == 'object') msg = JSON.stringify(msg);
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
    fs.appendFile(fileName, list.join('\r\n') + '\r\n\r\n', function () {
    });
};

exports.getStack = function (stack, start, end) {
    var stackList = [];
    if (stack) stackList = stack.split('\n');
    return stackList.slice(start, end);
};

exports.mkdirsSync = function (dirname, mode) {
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

//字符串
exports.stringFormat = function () {
    var args = arguments;
    var reg = /(\{\d\})/g
    var res = args[0] || '';
    var split = res.split(reg);
    for (var i = 0; i < split.length; i++) {
        var m = split[i].length >= 3 && split[i].match(/\{(\d)\}/);
        if (m) {
            var index = parseInt(m[1]);
            split[i] = split[i].replace('{' + index + '}', args[index + 1] || '');
        }
    }
    res = split.join('');
    return res;
};
//大写转 为 下划线小写
exports.upperCaseToLowerCaseWithUnderscode = function(str) {
    return str.replace(/[A-Z]/g, function () {
        return '_' + arguments[0].toLowerCase()
    });
};
//小驼峰转大驼峰
exports.littleCamelCaseToBigCamelCase = function(str){
    return str[0].toUpperCase() + str.substr(1);
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
            s: date.getSeconds(),
            S: date.getMilliseconds()
        };

        var formatStr = format.replace(/(y+|M+|d+|h+|H+|m+|s+|S+)/g, function (e) {
            if (e.match(/S+/))
                return ('' + eval('o.' + e.slice(-1))).slice(0, e.length);
            else
                return ((e.length > 1 ? '0' : '') + eval('o.' + e.slice(-1))).slice(-(e.length > 2 ? e.length : 2));
        });
        return formatStr;
    } catch (ex) {
        return '';
    }
};
//console.log(exports.dateFormat(null,'yyyy-MM-dd hh:mm:ss'))
//console.log(exports.dateFormat(null,'yyyy-MM-dd H:mm:ss'))

exports.isInArray = function (obj, list) {
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

exports.md5 = function (data, option) {
    var opt = {
        method: 'hex',
    };
    opt = common.extend(opt, option);
    var md5 = crypto.createHash('md5');
    if (typeof(data) == 'string')
        data = new Buffer(data, 'utf8');
    var code = md5.update(data).digest(opt.method);
    return code;
};

function s4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
};

exports.guid = function () {
    return (s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4());
};

exports.logModle = function () {
    return {
        url: null,
        method: null,
        result: null,
        code: null,
        req: null,
        res: null,
        create_date: common.dateFormat(new Date(), 'yyyy-MM-dd HH:mm:ss'),
        remark: null,
    };
};

exports.logSave = function (log) {
    for (var key in log) {
        var value = log[key];
        var type = typeof(value);
        if (value !== null && type == 'object')
            log[key] = JSON.stringify(value);
    }
    return logService.save(log);
};

// var soap = require('soap');
// var url = 'http://www.webxml.com.cn/WebServices/WeatherWebService.asmx?wsdl';
// var args = { byProvinceName: '浙江'};
// soap.createClient(url, function(err, client) {
//     client.getSupportCity(args, function(err, result) {
//         if (err) {
//             console.log(err);
//         }else {
//             console.log(result);
//         }
//     });
// });

//删除require
//delete require.cache[require.resolve('./configData')];

//.prototype
//.prototype.constructor
//[] instanceof Array
//[].constructor == Array

exports.streamToBuffer = function (stream) {
    return common.promise().then(function (res) {
        var buffers = [];
        stream.on('data', function (buffer) {
            buffers.push(buffer);
        });
        stream.on('end', function () {
            var buffer = Buffer.concat(buffers);
            res.resolve(buffer);
        });
        stream.on('error', res.reject);
        return res.promise;
    });
};