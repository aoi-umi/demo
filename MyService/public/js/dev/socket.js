/**
 * Created by umi on 2017-8-30.
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", 'jquery', 'jquery.cookie', 'config', 'io'], factory);
    } else {
        let exports = {};
        window.socket = factory(require, exports);
    }
})(function (require, exports) {
    let $ = require('jquery');
    let config = require('config');
    let io = require('io');
    exports.connection = null;
    exports.init = function () {
        var self = this;
        self.connection = io.connect(location.host);
        self.bindEvent();
    };
    exports.bindEvent = function () {
        var self = this;
        var connection = self.connection;
        connection.on('connect', function () {
            var userInfo = $.cookie(config.cacheKey.userInfo);
            connection.emit('init', {
                user: userInfo,
            });
        });
        connection.on('err', function (e) {
            console.log(e);
        });
        connection.on('onlineCount', function (onlineCount) {
            $('#onlineCount').html(onlineCount >= 0 ? onlineCount : '获取失败');
        });
    };
    return exports;
});