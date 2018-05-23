/**
 * Created by umi on 2017-5-29.
 */
import * as fs from 'fs';
import * as path from 'path';
import * as request from 'request';
import * as net from 'net';
import * as crypto from 'crypto';
import * as Q from 'q';
import * as zlib from 'zlib';
import config from '../../config';
import errorConfig from './errorConfig';
import * as logService from '../service/logService';

export let extend = function (...args) {
    var res;
    for (var i in args) {
        var arg = args[i];
        if (typeof (arg) == 'object') {
            if (!res) res = arg;
            else {
                for (var key in arg) {
                    if (arg[key] != undefined)
                        res[key] = arg[key];
                }
            }
        }
    }
    return res;
};

/**
 * 
 * @param fn 带nodeCallback参数的方法
 * @param caller 调用对象
 * @param nodeCallback false通过defer控制,true cb参数控制
 * @param args 
 */
export let promise = function (fn: Function, caller?: any, nodeCallback?: boolean, ...args): Q.Promise<any> {
    var defer = Q.defer();
    try {
        if (!fn) {
            throw error('fn can not be null');
        }
        if (!args)
            args = [];
        if (!nodeCallback) {
            var def = Q.defer();
            args.push(def);
            defer.resolve(fn.apply(caller, args));
        } else {
            args.push(function (err, ...cbArgs) {
                if (err)
                    defer.reject(err);
                else {
                    defer.resolve.apply(void 0, cbArgs);
                }
            });
            fn.apply(caller, args);
        }
    } catch (e) {
        defer.reject(e);
    }
    return defer.promise;
};

//示例
// let fun = function (type, def) {
//     if (type == 1) {
//         setTimeout(() => {
//             def.resolve('promise_' + type);
//         }, 1000);
//         return def.promise;
//     } else if (type == 2) {
//         setTimeout(() => {
//             let cb = def;
//             cb(null, 'promise_' + type)
//         }, 1000);
//     }
// }
// promise(fun, void 0, false, 1).then((t) => {
//     console.log(t);
// });

// promise(fun, void 0, true, 2).then((t) => {
//     console.log(t);
// });

export let promisify = function (fun, caller?) {
    return function (...args) {
        return promise.apply(void 0, [fun, caller, true, ...args]);
    };
};

export let promisifyAll = function (obj) {
    for (var key in obj) {
        if (typeof obj[key] == 'function')
            obj[key + 'Promise'] = promisify(obj[key], obj);
    }
};

export let requestServiceByConfig = function (option) {
    var method = '';
    var url = '';
    var log: any = logModle();
    var startTime = new Date().getTime();
    return promise(function () {
        var errStr = 'service "' + option.serviceName + '"';
        var service = config.api[option.serviceName];
        if (!service) throw error(errStr + ' is not exist!');
        var serviceArgs = null;

        var defaultMethodArgs = {
            isUseDefault: true,
            method: 'POST',
        }
        var methodArgs = service.method[option.methodName];
        methodArgs = extend(defaultMethodArgs, methodArgs);
        //console.log(methodArgs);
        if (methodArgs.isUseDefault) {
            serviceArgs = service.defaultArgs;
        }
        else {
            serviceArgs = methodArgs.args;
        }
        if (!serviceArgs) throw error(errStr + ' args is empty!');

        var host = serviceArgs.host;
        if (!host) throw error(errStr + ' host is empty!');

        method = methodArgs.method;
        url = methodArgs.url;
        if (!url) throw error(errStr + ' method "' + option.methodName + '" url is empty!');
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
        log.guid = guid();
        log.url = url;
        log.req = opt.body;
        log.method = '[' + option.serviceName + '][' + option.methodName + ']';
        log.duration = startTime - new Date().getTime();
        return requestService(opt);
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
            logSave(log);
        }
    });
};

export let requestService = function (option) {
    var opt: any = {
        method: 'POST',
        json: true,
        encoding: null,
    };
    opt = extend(opt, option);
    if (!opt.headers) opt.headers = {};
    opt.headers['x-requested-with'] = 'xmlhttprequest';
    //console.log(opt)
    return promise(function (res) {
        request(opt, function (err, response, data) {
            return promise(() => {
                if (err)
                    throw err;
                var encoding = response.headers['content-encoding'];
                if (encoding) {
                    switch (encoding) {
                        case 'gzip':
                            return unzipPromise(data).then(function (buffer) {
                                data = buffer.toString();
                                if (data && typeof data == 'string')
                                    data = JSON.parse(data);
                                return data;
                            });
                        default:
                            throw error('Not Accept Encoding');
                    }
                }
                if (Buffer.isBuffer(data)) {
                    data = data.toString();
                }
                return data;
            }).then(t => {
                return res.resolve(t);
            }).catch(e => {
                return res.reject(e);
            });
        });
        return res.promise;
    }).fail(function (e) {
        throw e;
    });
};

export let unzipPromise = promisify(zlib.unzip);

//code: string || errorConfig
export let error = function (msg, code?, option?) {
    var opt = {
        sourceName: '',
        lang: 'zh',
        format: null,
    };
    var status = null;
    if (option)
        opt = extend(opt, option);
    if (!code)
        code = '';
    var error;
    if (typeof code !== 'string') {
        error = code;
        code = error.code;
    }
    else {
        error = getErrorConfigByCode(code);
    }
    if (error) {
        status = error.status;
        if (!msg) {
            msg = error.desc[opt.lang];
            if (typeof opt.format == 'function')
                msg = opt.format(msg);
        }
    }
    if (!msg) msg = '';
    if (typeof msg == 'object') msg = JSON.stringify(msg);
    var err: any = new Error(msg);
    err.code = code;
    err.status = status;
    return err;
};

export let getErrorConfigByCode = function (code) {
    for (let key in errorConfig) {
        if (errorConfig[key].code == code)
            return errorConfig[key];
    }
};

export let writeError = function (err, opt?) {
    console.error(err);

    var list = [];
    var createDate = dateFormat(new Date(), 'yyyy-MM-dd');
    var createDateTime = dateFormat(new Date(), 'yyyy-MM-dd HH:mm:ss');
    list.push(createDateTime);
    if (opt)
        list.push(JSON.stringify(opt));
    list.push(err);
    //用于查找上一级调用
    var stack = new Error().stack;
    var stackList = ['stack:']
        .concat(getStack(err.stack))
        .concat(['help stack:'])
        .concat(getStack(stack));
    for (var i = 0; i < stackList.length; i++) {
        console.error(stackList[i]);
        list.push(stackList[i]);
    }

    //write file
    mkdirsSync(config.errorDir);
    var fileName = config.errorDir + '/' + createDate + '.txt';
    fs.appendFile(fileName, list.join('\r\n') + '\r\n\r\n', function () {
    });
};

export let getStack = function (stack) {
    var stackList = [];
    var matchPath = [
        '../../bin',
        '../../app',
        '../../routes',
    ];
    for (var i = 0; i < matchPath.length; i++) {
        matchPath[i] = path.resolve(`${__dirname}/${matchPath[i]}`);
    }
    var list = [];
    if (stack) stackList = stack.split('\n');
    stackList.forEach(t => {
        for (var i = 0; i < matchPath.length; i++) {
            if (t.indexOf(matchPath[i]) >= 0) {
                list.push(t);
                break;
            }
        }
    });
    return list;
};

export let mkdirsSync = function (dirname, mode?) {
    if (fs.existsSync(dirname)) {
        return true;
    } else {
        if (mkdirsSync(path.dirname(dirname), mode)) {
            fs.mkdirSync(dirname, mode);
            return true;
        } else {
            return false;
        }
    }
}

export let getClientIp = function (req) {
    // var ip = req.headers['x-forwarded-for']
    // || req.connection.remoteAddress
    // || req.socket.remoteAddress
    // || req.connection.socket.remoteAddress;
    var ip = req.ip;
    return ip;
};

export let IPv4ToIPv6 = function (ip, convert) {
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
// console.log(export let IPv4ToIPv6('192.168.1.1'))
// console.log(export let IPv4ToIPv6('192.168.1.1', true))

//字符串
export let stringFormat = function (...args) {
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

//小写下划线
export let stringToLowerCaseWithUnderscore = function (str) {
    str = str.replace(/^[A-Z]+/, function () {
        return arguments[0].toLowerCase();
    });
    str = str.replace(/_/g, '');
    str = str.replace(/[A-Z]/g, function () {
        return '_' + arguments[0].toLowerCase();
    });
    str = str.toLowerCase();
    return str;
};
//驼峰（小驼峰）
export let stringToCamelCase = function (str) {
    str = str.replace(/_([a-zA-Z])/g, function () {
        return arguments[1].toUpperCase();
    });
    return str[0].toLowerCase() + str.substr(1);
};
//帕斯卡（大驼峰）
export let stringToPascal = function (str) {
    str = str.replace(/_([a-zA-Z])/g, function () {
        return arguments[1].toUpperCase();
    });
    return str[0].toUpperCase() + str.substr(1);
};

export let dateFormat = function (date, format) {
    try {
        if (!format) format = 'yyyy-MM-dd';
        if (!date)
            date = new Date();
        else if (typeof date == 'number' || typeof date == 'string')
            //@ts-ignore
            date = new Date(date);

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
                return ('' + o[e.slice(-1)]).slice(0, e.length);
            else
                return ((e.length > 1 ? '0' : '') + o[e.slice(-1)]).slice(-(e.length > 2 ? e.length : 2));
        });
        return formatStr;
    } catch (ex) {
        return '';
    }
};
//console.log(export let dateFormat(null,'yyyy-MM-dd hh:mm:ss'))
//console.log(export let dateFormat(null,'yyyy-MM-dd H:mm:ss'))

export let isInArray = function (obj, list) {
    if (list) {
        for (var i = 0; i < list.length; i++) {
            var t = list[i];
            if (t === obj) {
                return true;
            }
        }
    }
    return false;
};

export let createToken = function (str) {
    var code = md5(str);
    return code;
};

export let md5 = function (data, option?) {
    var opt = {
        encoding: 'hex',
    };
    opt = extend(opt, option);
    var md5 = crypto.createHash('md5');
    if (typeof (data) == 'string')
        data = new Buffer(data, 'utf8');
    //@ts-ignore
    var code = md5.update(data).digest(opt.encoding);
    return code;
};

function s4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
};

export let guid = function () {
    return (s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4());
};

export let logModle = function () {
    return {
        url: null,
        method: null,
        result: null,
        code: null,
        req: null,
        res: null,
        createDate: dateFormat(new Date(), 'yyyy-MM-dd HH:mm:ss'),
        remark: null,
    };
};

export let logSave = function (log) {
    for (var key in log) {
        var value = log[key];
        var type = typeof (value);
        if (value !== null && type == 'object')
            log[key] = JSON.stringify(value);
    }
    return logService.save(log).fail(function () {

    });
};

// import * as soap from 'soap';
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

export let streamToBuffer = function (stream) {
    return promise(function (res) {
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

export let getListDiff = function (option) {
    var opt: any = {
        compare: function (item1, item2) {
            return item1 == item2;
        },
        delReturnValue: function (item) {
            return item;
        },
        addReturnValue: function (item) {
            return item;
        }
    };
    opt = extend(opt, option);
    var list = opt.list, newList = opt.newList,
        compare = opt.compare, delReturnValue = opt.delReturnValue, addReturnValue = opt.addReturnValue;
    var delList = [];
    var addList = [];
    if (newList && newList.length) {
        list.forEach(function (item) {
            var match = newList.find(function (item2) {
                return compare(item, item2);
            });
            if (!match)
                delList.push(delReturnValue(item));
        });
        newList.forEach(function (item2) {
            var match = list.find(function (item) {
                return compare(item, item2);
            });
            if (!match)
                addList.push(addReturnValue(item2));
        });
    } else {
        list.forEach(function (item) {
            delList.push(delReturnValue(item));
        });
    }
    return {
        addList: addList,
        delList: delList
    };
};

export let parseBool = function (b) {
    var result = false;
    if (b && b.toLocaleString() == 'true')
        result = true;
    return result;
}