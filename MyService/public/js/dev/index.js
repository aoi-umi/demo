namespace('index');
index = {
    init: function () {
        var self = this;
        //socket
        var socketData = {
            postSuccess: {}
        };

        var connection = socket.connection;
        if (connection) {
            setInterval(function () {
                for (var id in socketData.postSuccess) {
                    var existMsg = $('[data-id="' + id + '"]');
                    if (existMsg.length) {
                        existMsg.removeClass('loading').addClass('success');
                    } else {
                        socketData.postSuccess[id].times++;
                        if (socketData.postSuccess[id].times > 5)
                            delete socketData.postSuccess[id];
                    }
                }
            }, 1000);

            connection.on('newMsg', function (data) {
                data.status = 1;
                self.appendMsg(data);
            });

            connection.on('postSuccess', function (data) {
                var id = data.user + data.msgId;
                var existMsg = $('[data-id="' + id + '"]');
                if (existMsg.length) {
                    existMsg.removeClass('loading').addClass('success');
                } else {
                    socketData.postSuccess[id] = {
                        times: 0
                    };
                }
            });
        }
        //上传文件
        var control = $('#upfile');
        control.fileinput({
            showUpload: true, //是否显示上传按钮
            showRemove: true,
            dropZoneEnabled: true,
            showCaption: true,//是否显示标题
            //showPreview:false,
            allowedPreviewTypes: ['image'],
            allowedFileTypes: ['image'],
            //allowedFileExtensions:  ['jpg', 'png'],
            maxFileSize: 2000,
            maxFileCount: 1,
            //initialPreview: [
            //预览图片的设置
            //      "<img src='' class='file-preview-image' alt='' title=''>",
            //],
        });

        //tab
        my.tab.init();
        var tabData = [{
            id: 'tab-home',
            name: 'Home',
            targetId: 'panel-home',
        }];
        $('#myTab').append(my.tab.tabs(tabData));

        var tabPanelData = [{
            type: 'template',
            id: 'panel-test',
            content: 'testTemplate'
        }];
        $('#myPanel').append(my.tab.panels(tabPanelData));

        $('#tab-home').click();
        var notice0;
        $('.msgNotice').on('click', function () {
            var dom = $(this);
            var type = dom.data('type');
            if (type == 0) {
                if (notice0)
                    notice0.toggle();
                else
                    notice0 = common.msgNotice({msg: '12333', target: '.msgNotice[data-type=0]'});
            } else if (type == 1) {
                var msgNoticeBtnCount = parseInt($('#msgNoticeBtnCount').val());
                var btnOptList = [];
                for (var i = 1; i <= msgNoticeBtnCount; i++) {
                    btnOptList.push({
                        content: '按钮' + i,
                        cbOpt: i,
                        cb: function (opt) {
                            console.log(opt);
                        }
                    });
                }
                common.msgNotice({
                    msg: '12333',
                    type: 1,
                    noClose: $('#msgNoticeNoClose').prop('checked'),
                    btnOptList: btnOptList
                });
            }
        });

        var availableTags = [
            'ActionScript',
            'AppleScript',
            'Asp',
            'BASIC',
            'C',
            'C++',
            'Clojure',
            'COBOL',
            'ColdFusion',
            'Erlang',
            'Fortran',
            'Groovy',
            'Haskell',
            'Java',
            'JavaScript',
            'Lisp',
            'Perl',
            'PHP',
            'Python',
            'Ruby',
            'Scala',
            'Scheme'
        ];
        var sourceList = [];
        //sourceList = availableTags;
        $(availableTags).each(function () {
            sourceList.push({key: this});
        });

        function clearData() {
            if (!$('#autocomplete').val()) {
                $('#autocomplete').data('item', null);
            }
        }

        $('#autocomplete').on('keydown', function (event) {
            if (event.keyCode === $.ui.keyCode.TAB &&
                $(this).data('ui-autocomplete').menu.active) {
                event.preventDefault();
            }
            clearData();
        }).on('blur', function () {
            clearData();
        }).on('focus', function () {
            $(this).autocomplete('search');
        }).autocomplete({
            minLength: 0,
            source: function (request, response) {
                var match = _.filter(sourceList, function (t) {
                    var matcher = new RegExp($.ui.autocomplete.escapeRegex(request.term), 'i');
                    return matcher.test(t.key);
                });
                response(match.slice(0, 10));
            },
            focus: function () {
                return false;
            },
            select: function (event, ui) {
                $(this).data('item', ui.item).val(ui.item.key);
                return false;
            }
        }).data('ui-autocomplete')._renderItem = function (ul, item) {
            return $('<li>')
                .append('<div>' + item.key + '</div>')
                .appendTo(ul);
        };

        var timer1 = setInterval(function () {
            $('#countdown').html(common.getDateDiff(new Date(), '2018-02-01'));
            $('#countdown2').html(common.getDateDiff(new Date(), common.dateFormat(new Date()) + ' 18:30'));
        }, 1000);

        self.bindEvent();
    },
    bindEvent: function () {
        var self = this;

        var connection = socket.connection;
        if (connection) {
            $('#postMsg').on('click', function () {
                var msg = $('#msg').val();
                if (msg) {
                    var userInfo = $.cookie(config.cacheKey.userInfo);
                    var msgId = common.s4();
                    connection.emit('postMsg', {
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
        }
    },
    appendMsg: function (opt) {
        //status
        //0  发送中 1 发送成功
        //-1 发送失败
        var className = [];
        switch (opt.status) {
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
        if (opt.self || userInfo == opt.user) {
            className.push('self');
        }
        opt.className = className.join(' ');
        var msgItemTemp = $('#msgItem').html();

        $('#msgBox').append(ejs.render(msgItemTemp, opt));
    }
};