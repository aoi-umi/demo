/**
 * Created by umi on 2017-8-30.
 */
var socket = {
    socket: null,
    init: function () {
        var self = this;
        self.socket = io.connect(location.origin);
        self.bindEvent();
    },
    bindEvent:function () {
        var self = this;
        var socket = self.socket;
        socket.on('onlineCount', function (onlineCount) {
            $('#onlineCount').html(onlineCount >= 0 ? onlineCount : '获取失败');
        });

        $('#postMsg').on('click', function () {
            var msg = $('#msg').val();
            socket.emit('postMsg', msg);
        });
        socket.on('newMsg', function (msg) {
            var msg = '<div>' + msg + '</div>';
            $('#msgBox').append(msg);
        });
    }
};