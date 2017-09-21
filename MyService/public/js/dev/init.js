/**
 * Created by bang on 2017-9-11.
 */
$(function () {
    ejs.open = '{%';
    ejs.close = '%}';

    var userInfo = $.cookie(config.cacheKey.userInfo);
    if(!userInfo){
        userInfo = extend.guid();
    }
    $.cookie(config.cacheKey.userInfo, userInfo, { expires: 30 });

    socket.init();
    my.interface.init();

    $('.nav.navbar-nav').on('click','li', function(){
        $(this).addClass('active').siblings().removeClass('active');
    });

    $(`.nav.navbar-nav a[href="${location.pathname}"]`).closest('li').addClass('active');

    bindEvent();
});

function bindEvent(){
    $(document).on('click', '.close', function () {
        var closeTarget = $(this).attr('data-close-target');
        if (closeTarget) {
            var closeType = $(this).attr('data-close-type');
            switch (closeType){
                case '0':
                default:
                    $(closeTarget).remove();
                    break;
                case '1':
                    $(closeTarget).hide();
                    break;
            }
        }
    });
}

//
function namespace(namespace) {
    var list = namespace.split('.');
    var ns = window[list[0]];
    if(ns && list.length == 1)
        throw new Error('namespace [' + namespace + '] is exist!');
    if (!ns)
        ns = window[list[0]] = {};
    for (var i = 1; i < list.length; i++) {
        var ns_next = ns[list[i]];
        if (!ns_next)
            ns[list[i]] = {};
        else if (i == list.length - 1)
            throw new Error('namespace [' + namespace + '] is exist!');
        ns = ns[list[i]];
    }
    return ns;
}

function getBrowserType() {
    var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串

    var isOpera = userAgent.indexOf('Opera') > -1;
    if (isOpera) {
        return 'Opera'
    }

    if (userAgent.indexOf('Firefox') > -1) {
        return 'Firefox';
    }
    if (userAgent.indexOf('Chrome') > -1) {
        return 'Chrome';
    }

    if (userAgent.indexOf('Safari') > -1) {
        return 'Safari';
    }

    if (userAgent.indexOf('compatible') > -1 && userAgent.indexOf('MSIE') > -1 && !isOpera) {
        return 'IE';
    }
}