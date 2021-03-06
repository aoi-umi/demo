import * as main from '../_main';
import * as cache from '../_system/cache';
import * as socket from '../socket';

export let query = function (opt) {
    var onlineUser = socket.onlineUser;
    return onlineUser;
};

export let detailQuery = function (opt: { key?: string }) {
    var key = main.cacheKey.userInfo + opt.key;
    return cache.get(key).then(function (t) {
        return t;
    });
};