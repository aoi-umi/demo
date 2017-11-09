/**
 * Created by umi on 2017-8-30.
 */
namespace('socket');
socket = {
    socket: null,
    socketData:{
        postSuccess:{}
    },
    init: function () {
        var self = this;
        self.socket = io.connect(location.origin);
        self.bindEvent();

        setInterval(function() {
            var socketData = self.socketData;
            for(var id in socketData.postSuccess){
                var existMsg = $('[data-id="' + id + '"]');
                if(existMsg.length){
                    existMsg.removeClass('loading').addClass('success');
                }else {
                    socketData.postSuccess[id].times++;
                    if(socketData.postSuccess[id].times > 5)
                        delete socketData.postSuccess[id];
                }
            }
        }, 1000);
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
                var userInfo = $.cookie(config.cacheKey.userInfo);
                var msgId = common.s4();
                socket.emit('postMsg', {
                    user: userInfo,
                    content: msg,
                    msgId: msgId,
                });
                self.appendMsg({
                    datetime: common.dateFormat(new Date(), 'yyyy-MM-dd HH:mm:ss'),
                    user: userInfo,
                    content: msg,
                    msgId: msgId,
                    status: 0,
                    self: true,
                });
            }
        });

        socket.on('newMsg', function (data) {
            data.status = 1;
            self.appendMsg(data);
        });

        socket.on('postSuccess', function (data) {
            var id = data.user + data.msgId;
            var existMsg = $('[data-id="' + id + '"]');
            if(existMsg.length){
                existMsg.removeClass('loading').addClass('success');
            }else {
                var socketData = self.socketData;
                socketData.postSuccess[id] = {
                    times: 0
                };
            }
        });
    },
    appendMsg:function (opt) {
        //status
        //0  发送中 1 发送成功
        //-1 发送失败
        var className = [];
        switch(opt.status){
            case 0:
                className.push('loading');
                break;
            case 1:
                className.push('success');
                break;
            case -1:
                className.push('fail');
                break;
        }
        var userInfo = $.cookie(config.cacheKey.userInfo);
        if(opt.self || userInfo == opt.user){
            className.push('self');
        }
        opt.className = className.join(' ');
        var msgItemTemp = $('#msgItem').html();

        $('#msgBox').append(ejs.render(msgItemTemp, opt));
    }
};