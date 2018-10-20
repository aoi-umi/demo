import * as Redis from 'ioredis';
import config from '../../config';
import * as common from './common';
import errorConfig from './errorConfig';

var client = new Redis({
    port: config.redis.port,
    host: config.redis.host,
});
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

export let get = function (key) {
    return common.promise((defer: Q.Deferred<any>) => {
        client.get(cachePrefix + key).then(result => {
            if (result && typeof result == 'string') {
                try {
                    result = JSON.parse(result);
                }
                catch (e) {
                }
            }
            defer.resolve(result);
        }).catch(defer.reject);
        //超时
        setTimeout(function () {
            defer.reject(common.error('Cache Get Timeout', errorConfig.CACHE_TIMEOUT));
        }, 10 * 1000);
        return defer.promise;
    });
}
//expire seconds
export let set = function (key, value, expire?) {
    return common.promise(() => {
        if (typeof value == 'object')
            value = JSON.stringify(value);
        let args = [cachePrefix + key, value];
        if (expire)
            args = [...args, 'EX', expire];
        return (client.set as any)(...args);
    });
};

export let del = function (key) {
    return client.del(cachePrefix + key);
};

export let keys = client.keys;

export let select = client.select;