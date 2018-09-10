import * as redis from 'redis';
import config from '../../config';
import * as common from './common';
import errorConfig from './errorConfig';

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

export let get = function (key) {
    return common.promise((defer: Q.Deferred<any>) => {
        common.promisify(client.get, client)(cachePrefix + key).then(result => {
            if (result && typeof result == 'string') {
                try {
                    result = JSON.parse(result);
                }
                catch (e) {
                }
            }
            defer.resolve(result);
        }).fail(defer.reject);
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
        return common.promisify(client.set, client)(...args);
    });
};

export let del = function (key) {
    return common.promisify(client.del, client)(cachePrefix + key);
};

export let keys = function (key) {
    return common.promisify(client.keys, client)(key);
};

export let select = function (db) {
    return common.promisify(client.select, client)(db);
};