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

    $('.nav.navbar-nav').on('click','li', function(){
        $(this).addClass('active').siblings().removeClass('active');
    });

    $(`.nav.navbar-nav a[href="${location.pathname}"]`).closest('li').addClass('active');
});

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