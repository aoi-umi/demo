import * as Redis from 'ioredis';
import * as moment from 'moment';

import * as config from '@/config';
import * as common from './common';

function writeCacheErr(err) {
    console.error(moment().format('yyyy-MM-dd HH:mm:ss'), 'Cache Error [' + err + ']');
}

let connectErrorTimes = 0;

export class Cache {
    client: Redis.Redis;
    cachePrefix: string;
    constructor(uri: string, cachePrefix?: string) {
        let client = this.client = new Redis(uri);
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
        this.cachePrefix = cachePrefix || '';
    }

    get(key) {
        return common.promise((defer: Q.Deferred<any>) => {
            this.client.get(this.cachePrefix + key).then(result => {
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
                defer.reject(common.error('Cache Get Timeout', config.error.CACHE_TIMEOUT));
            }, 10 * 1000);
            return defer.promise;
        });
    }

    //expire seconds
    set(key, value, expire?) {
        return common.promise(() => {
            if (typeof value == 'object')
                value = JSON.stringify(value);
            let args = [this.cachePrefix + key, value];
            if (expire)
                args = [...args, 'EX', expire];
            return (this.client.set as any)(...args);
        });
    }

    del(key) {
        return this.client.del(this.cachePrefix + key);
    }

    keys(pattern: string) {
        return this.client.keys(pattern);
    }
}