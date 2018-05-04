/**
 * Created by umi on 2017-8-31.
 */
var main = require('./_main');
var common = require('./_system/common');
var cache = require('./_system/cache');
var mySocket = exports;

exports.onlineCount = 0;
exports.onlineUser = {};
exports.io = null;
exports.init = function (io) {
    mySocket.io = io;
    mySocket.bindEvent();
};
exports.bindEvent = function () {
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