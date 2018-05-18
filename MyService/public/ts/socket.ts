/**
 * Created by umi on 2017-8-30.
 */
import * as main from './_main';
export let connection = null;
export let init = function () {
    var self = this;
    self.connection = io.connect(location.host);
    self.bindEvent();
};
export let bindEvent = function () {
    var self = this;
    var connection = self.connection;
    connection.on('connect', function () {
        var userInfo = $.cookie(main.cacheKey.userInfo);
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