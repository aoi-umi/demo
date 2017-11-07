/**
 * Created by umi on 2017-8-31.
 */
var common = require('./_system/common');
var mySocket = exports;

exports.onlineCount = 0;
exports.io = null;
exports.init = function (io) {
    mySocket.io = io;
    mySocket.bindEvent();
};
exports.bindEvent= function () {
    var io = mySocket.io;
    io.on('connection', function (socket) {
        mySocket.onlineCount++;
        io.sockets.emit('onlineCount', mySocket.onlineCount);

        socket.on('postMsg', function (opt) {
            //将消息发送到除自己外的所有用户
            socket.broadcast.emit('newMsg', {
                datetime: common.dateFormat(new Date(), 'yyyy-MM-dd HH:mm:ss'),
                user: opt.user,
                content: opt.content,
                msgId: opt.msgId,
            });
            socket.emit('postSuccess', {
                user: opt.user,
                msgId: opt.msgId,
            });
        });

        socket.on('disconnect', function () {
            if (mySocket.onlineCount > 0) {
                mySocket.onlineCount--;
                io.sockets.emit('onlineCount', mySocket.onlineCount);
            }
        });
    });
};