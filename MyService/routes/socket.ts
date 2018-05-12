/**
 * Created by umi on 2017-8-31.
 */
import * as main from './_main';
import * as common from './_system/common';
import * as cache from './_system/cache';
var mySocket = exports;

export let onlineCount = 0;
export let onlineUser = {};
export let io = null;
export let init = function (io) {
    mySocket.io = io;
    mySocket.bindEvent();
};
export let bindEvent = function () {
    var io = mySocket.io;
    io.on('connection', function (socket) {
        socket.myData = {};
        socket.on('init', function (opt) {
            tryFn(socket, function () {
                socket.myData.user = opt.user;
                if (!mySocket.onlineUser[opt.user]) {
                    mySocket.onlineUser[opt.user] = 1;
                    mySocket.onlineCount++;
                }
                else
                    mySocket.onlineUser[opt.user]++;
                io.sockets.emit('onlineCount', mySocket.onlineCount);
            });
        });

        socket.on('postMsg', function (opt) {
            tryFn(socket, function () {
                var userInfoKey = main.cacheKey.userInfo + opt.user;
                var userName = '';
                cache.get(userInfoKey).then(function (t) {
                    if (t && t.nickname)
                        userName = t.nickname;
                }).finally(function () {
                    //将消息发送到除自己外的所有用户
                    socket.broadcast.emit('newMsg', {
                        datetime: common.dateFormat(new Date(), 'yyyy-MM-dd HH:mm:ss'),
                        user: opt.user,
                        userName: userName,
                        content: opt.content,
                        msgId: opt.msgId,
                    });
                    socket.emit('postSuccess', {
                        user: opt.user,
                        msgId: opt.msgId,
                    });
                });
            });
        });

        socket.on('disconnect', function () {
            tryFn(socket, function () {
                var userLinks = mySocket.onlineUser[socket.myData.user];
                if (userLinks && userLinks > 0)
                    userLinks = --mySocket.onlineUser[socket.myData.user];
                if (userLinks <= 0 && mySocket.onlineCount > 0) {
                    mySocket.onlineCount--;
                    io.sockets.emit('onlineCount', mySocket.onlineCount);
                }
            });
        });
    });
};

function tryFn(socket, fn) {
    try {
        fn();
    } catch (e) {
        socket.emit('err', e.message);
    }
}