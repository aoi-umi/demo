var config = require('../../config');
var cache = require('../_system/cache');
var socket = require('../socket');

exports.query = function (opt, exOpt) {
    var onlineUser = socket.onlineUser;
    return onlineUser;
};

exports.detailQuery = function (opt, exOpt) {
    var key = config.cacheKey.userInfo + opt.key;
    return cache.get(key).then(function (t) {
        return t;
    });
};