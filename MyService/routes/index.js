var fs = require('fs');
var common = require('./_system/common');
var cache = require('./_system/cache');
var config = require('../config');
var socket = require('./socket');

exports.msg = function (req, res) {
    var notSupportedBrowser = common.parseBool(req.query.notSupportedBrowser);

    var opt = {
        message: req.query.message || '',
        notSupportedBrowser: notSupportedBrowser
    };
    res.myRender('msg', opt);
};

exports.upload = [require('./_system/multer').any(), function (req, res) {
    var success = req.files && req.files.length ? 'upload ' + req.files.length + ' file(s) success' : 'upload failed';
    if (req.files) {
        req.files.forEach(function (file) {
            var readStream = fs.createReadStream(file.path);
            common.streamToBuffer(readStream).then(function (buffer) {
                return common.md5(buffer);
            }).then(function (filename) {
                fs.rename(file.path, file.destination + '/' + filename);
            });
        });
    }
    var opt = {
        message: success,
    };
    res.mySend(null, opt);
}];

exports.onlineUserQuery = function (req, res, next) {
    var onlineUser = socket.onlineUser;
    res.mySend(null, onlineUser);
};

exports.onlineUserDetailQuery = function (req, res, next) {
    var key = config.cacheKey.userInfo + req.body.key;
    cache.get(key).then(function (t) {
        res.mySend(null, t);
    });
};

exports.requirejs = function (req, res) {
    res.myRender('requirejs');
};
