import 'fileinput';
import * as ejs from 'ejs';

import * as socket from './socket';
import * as myTab from './myTab';
import * as common from './common';
import * as main from './_main';

export let init = function () {
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
            appendMsg(data);
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
        uploadUrl: '/interface/upload?useStatus=true',
        showUpload: true, //是否显示上传按钮
        showRemove: true,
        dropZoneEnabled: true,
        showCaption: true,//是否显示标题
        //showPreview:false,
        //multiple: true,
        allowedPreviewTypes: ['image'],
        allowedFileTypes: ['image'],
        //allowedFileExtensions:  ['jpg', 'png'],
        maxFileSize: 2000,
        maxFileCount: 10,
        //initialPreview: [
        //预览图片的设置
        //      "<img src='' class='file-preview-image' alt='' title=''>",
        //],
    }).on('fileuploaded', function (event, data) {
        var res = data.response;
    }).on('fileuploaderror', function (event, data, msg) {
        var args = arguments;
        var res = data.response;
        if (!res.result) {
            return {
                message: res.desc,
                data: res.detail
            };
        }
    });

    //tab
    myTab.init({
        tabContainer: 'myTab1',
        panelContainer: 'myPanel1',
    });
    var tabData = [{
        id: 'tab-home',
        name: 'Home',
        targetId: 'panel-home',
    }];
    $('#myTab1').append(myTab.tabs(tabData));

    var tabPanelData = [{
        type: 'template',
        id: 'panel-test',
        content: 'testTemplate'
    }];
    $('#myPanel1').append(myTab.panels(tabPanelData));

    $('#tab-home').click();
    $('.msgNotice').on('click', function () {
        var dom = $(this);
        var type = dom.data('type');
        if (type == 0) {
            common.msgNotice({msg: '12333', target: '.msgNotice[data-type=0]'});
        } else if (type == 1) {
            var msgNoticeBtnCount = parseInt($('#msgNoticeBtnCount').val() as string);
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

    var sourceList = [
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
    common.autoComplete({
        source: sourceList,
        dom: $('#autocomplete')
    });

    var timer1 = setInterval(function () {
        $('#countdown').html(common.getDateDiff(new Date(), '9999-01-01'));
        $('#countdown2').html(common.getDateDiff(new Date(), common.dateFormat(new Date()) + ' 23:59'));
    }, 1000);

    bindEvent();
};
export let bindEvent = function () {
    var connection = socket.connection;
    if (connection) {
        $('#postMsg').on('click', function () {
            var msg = $('#msg').val();
            if (msg) {
                var userInfo = $.cookie(main.cacheKey.userInfo);
                var msgId = common.s4();
                connection.emit('postMsg', {
                    user: userInfo,
                    content: msg,
                    msgId: msgId,
                });
                appendMsg({
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
    $('#menuSearch').on('keyup', function () {
        var val = $.trim($(this).val() as string);
        $('#searchResult').empty();
        if (val) {
            if (!$('#searchResult').hasClass('in'))
                $('#menuSearchBtn').click();
            var list = [];
            $('#menu .menuItem').each(function () {
                var itemValue = $(this).text();
                if (itemValue.indexOf(val) >= 0) {
                    list.push($(this).clone());
                }
            });
            $('#searchResult').append(list);
        }
    });

    $('#countdownBtn').on('click', function () {
        var dom = $(this);
        common.setCountdown({
            dom: dom,
            countdown: 21,
            interval: 1
        });
    });

    var trigger = $('.hamburger'),
        isClosed = false;
    trigger.on('click', function () {
        if (isClosed == true) {
            trigger.removeClass('is-open');
            trigger.addClass('is-closed');
            isClosed = false;
        } else {
            trigger.removeClass('is-closed');
            trigger.addClass('is-open');
            isClosed = true;
        }
    });
    $('[data-toggle="offcanvas"]').on('click', function () {
        $('#wrapper').toggleClass('toggled');
    });
};
export let appendMsg = function (opt) {
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
    var userInfo = $.cookie(main.cacheKey.userInfo);
    if (opt.self || userInfo == opt.user) {
        opt.userName = '';
        className.push('self');
    }
    opt.className = className.join(' ');
    var msgItemTemp = $('#msgItem').html();

    $('#msgBox').append(ejs.render(msgItemTemp, opt));
};