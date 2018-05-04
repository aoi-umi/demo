var redis = require('redis');
var config = require('../../config');
var common = require('./common');
var errorConfig = require('./errorConfig');

var client = redis.createClient(config.redis.port, config.redis.host);
var cachePrefix = config.cachePrefix ? config.cachePrefix + ':' : '';

function writeCacheErr(err) {
    console.error(common.dateFormat(null, 'yyyy-MM-dd HH:mm:ss'), 'Cache Error [' + err + ']');
}

var connectErrorTimes = 0;
client.on('error', function (err) {
    if (err.code == 'ECONNREFUSED') {
        if (connectErrorTimes % 10 == 0) {
            writeCacheErr(err);
            connectErrorTimes = 0;
        }
        connectErrorTimes++;
    } else {
        writeCacheErr(err);
    }
});

var _module = {};
_module.get = function (key, cb) {
    var isCallback = false;
    client.get(cachePrefix + key, function (err, result) {
        if (result && typeof result == 'string') {
            try {
                result = JSON.parse(result);
            }
            catch (e) {
            }
        }
        if (!isCallback) {
            cb(err, result);
            isCallback = true;
        }
    });
    setTimeout(function () {
        if (!isCallback) {
            cb(common.error('Cache Get Timeout', errorConfig.CACHE_TIMEOUT));
            isCallback = true;
        }
    }, 10 * 1000);
};

_module.set = function (key, value, expire, cb) {
    if (typeof expire == 'function') {
        cb = expire;
        expire = 0;
    }
    if (typeof value == 'object') value = JSON.stringify(value);
    client.set(cachePrefix + key, value, cb);
    if (expire)
        client.expire(cachePrefix + key, expire);
};

_module.del = function (key, cb) {
    client.del(cachePrefix + key, cb);
};

_module.keys = function (key, cb) {
    client.keys(key, cb);
};

_module.select = function (db, cb) {
    client.select(db, cb);
};

exports.get = function (key, cb) {
    var fun = _module.get;
    if (!cb) fun = _module.getPromise;
    return fun.apply(null, arguments);
}
//expire seconds
exports.set = function (key, value, expire, cb) {
    if (typeof expire == 'function') {
        cb = expire;
    }
    var fun = _module.set;
    if (!cb) fun = _module.setPromise;
    return fun.apply(null, arguments);
};

exports.del = function (key, cb) {
    var fun = _module.del;
    if (!cb) fun = _module.delPromise;
    return fun.apply(null, arguments);
};

exports.keys = function (key, cb) {
    var fun = _module.keys;
    if (!cb) fun = _module.keysPromise;
    return fun.apply(null, arguments);
};

exports.select = function (db, cb) {
    var fun = _module.select;
    if (!cb) fun = _module.selectPromise;
    return fun.apply(null, arguments);
};

var promiseList = ['get', 'set', 'del', 'keys', 'select'];
promiseList.forEach(function (funName) {
    _module[funName + 'Promise'] = common.promisify(_module[funName]);
});

//exports.select(2, function() {
//    exports.set('foo', {bar: 'bar'}, 60, function (err, result) {
//        console.log(err, result);
//        exports.get('foo', function (err, result) {
//            console.log(err, result)
//        });
//    });
//});
//
//exports.keys('*', function(err, result) {
//    console.log(err, result)
//});
//
//exports.get('foo', function(err, result) {
//    console.log(err, result)
//});
////setTimeout(function(){
////    exports.del('foo', function(err, result) {
////        console.log('del', err, result)
////    });
////},1000);
//setTimeout(function(){
//    exports.get('foo', function(err, result) {
//        console.log(err, result)
//    });
//},2000);