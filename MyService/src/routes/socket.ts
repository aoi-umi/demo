/**
 * Created by umi on 2017-8-31.
 */
import * as cookie from 'cookie';
import * as main from './_main';
import * as common from './_system/common';
import * as cache from './_system/cache';

export let onlineCount = 0;
export let onlineUser = {};
interface Socket extends SocketIO.Socket {
    myData?: {
        user?: string;
    }
    cookies: any;
}

export let io: SocketIO.Server = null;
export let init = function (optIO: SocketIO.Server) {
    io = optIO;
    bindEvent();
};
let bindEvent = function () {
    io.on('connection', function (socket: Socket) {
        let cookieData = socket.cookies = cookie.parse(socket.handshake.headers.cookie);
        let userCacheKey = cookieData[main.cacheKey.userInfo];
        socket.myData = {};
        tryFn(socket, function () {
            socket.myData.user = userCacheKey;
            if (!onlineUser[userCacheKey]) {
                onlineUser[userCacheKey] = 1;
                onlineCount++;
            }
            else
                onlineUser[userCacheKey]++;
            io.sockets.emit('onlineCount', onlineCount);
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
                var userLinks = onlineUser[socket.myData.user];
                if (userLinks && userLinks > 0)
                    userLinks = --onlineUser[socket.myData.user];
                if (userLinks <= 0 && onlineCount > 0) {
                    onlineCount--;
                    io.sockets.emit('onlineCount', onlineCount);
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