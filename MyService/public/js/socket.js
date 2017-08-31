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
            if(msg) {
                socket.emit('postMsg', msg);
                self.appendMsg({
                    datetime: extend.dateFormat(new Date(), 'yyyy-MM-dd HH:mm:ss'),
                    user: '',
                    content: msg,
                });
            }
        });
        socket.on('newMsg', function (data) {
            self.appendMsg(data);
        });
    },
    appendMsg:function (opt) {
        var msgItemTemp = $('#msgItem').html();
        $('#msgBox').append(ejs.render(msgItemTemp, opt));
    }
};