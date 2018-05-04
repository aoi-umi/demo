var main = require('../_main');
var cache = require('../_system/cache');
var socket = require('../socket');

exports.query = function (opt, exOpt) {
    var onlineUser = socket.onlineUser;
    return onlineUser;
};

exports.detailQuery = function (opt, exOpt) {
    var key = main.cacheKey.userInfo + opt.key;
    return cache.get(key).then(function (t) {
        return t;
    });
};