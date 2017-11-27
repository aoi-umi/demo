/**
 * Created by bang on 2017-9-11.
 */
function namespace(namespace) {
    var list = namespace.split('.');
    var ns = window[list[0]];
    if (ns && list.length == 1)
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

namespace('init');
init = {
    variable: {
        frameDom: null,
        frameDefaultHeight: 0,
    },
    init: function () {
        var self = this;
        ejs.open = '{%';
        ejs.close = '%}';

        var userInfo = $.cookie(config.cacheKey.userInfo);
        if (!userInfo) {
            userInfo = common.guid();
        }
        $.cookie(config.cacheKey.userInfo, userInfo, {expires: 30});

        socket.init();
        my.interface.init({
            interfaceConfig: {
                signUp: {
                    url: '/sign/up'
                },
                signIn: {
                    url: '/sign/in'
                },
                signOut: {
                    url: '/sign/out'
                },
                logQuery: {
                    url: '/log/query'
                },
                mainContentStatusUpdate: {
                    url: '/mainContent/statusUpdate'
                },
            },
            moduleList: [
                'mainContent',
                //'mainContentChild',
                //'mainContentLog',
                //'mainContentTypeId',
                'mainContentType',
            ]
        });
        sign.init();
        $(`.nav.navbar-nav a[href="${location.pathname}"]`).closest('li').addClass('active');

        self.bindEvent();
    },
    bindEvent: function () {
        var self = this;
        //导航
        $('.nav.navbar-nav').on('click', 'li', function () {
            $(this).addClass('active').siblings().removeClass('active');
        });

        $(document).on('click', '.close', function () {
            var closeTarget = $(this).data('close-target');
            if (closeTarget) {
                var closeType = $(this).data('close-type');
                switch (closeType) {
                    case 'remove':
                    default:
                        $(closeTarget).remove();
                        break;
                    case 'hide':
                        $(closeTarget).hide();
                        break;
                }
            }
        });

        //浮动
        $('.hover').on('mouseover mouseleave', function (e) {
            var dom = $(this);
            var target = $(dom.attr('href'));
            if (target.length && dom.hasClass('hover-source')) {
                target.css({'left': dom.position().left, 'margin-top': '0px'});
            } else if (dom.hasClass('hover-target'))
                target = dom;
            if (!target.length)
                return;
            switch (e.type) {
                case 'mouseover':
                    target.show();
                    break;
                case 'mouseleave':
                    target.hide();
                    break;
            }
        });

        var args = common.getArgsFromUrlParams();
        if (args.iframeId) {
            var dom = iframe = $(parent.document).find('#' + args.iframeId);
            if (iframe.closest('.tab-pane').length)
                dom = iframe.closest('.tab-pane');
            if (dom.length) {
                self.variable.frameDom = dom;
                self.variable.frameDefaultHeight = args.height || 512;
                $(window).on('load resize mousemove', function (e) {
                    self.updateView(['scroll']);
                });
            }
        }
    },
    updateView: function (list) {
        var self = this;
        if (!list || common.isInArray('scroll', list)) {
            var height = $('body').outerHeight(true);
            var isChanged = false;
            var frameHeight = self.variable.frameDom.height();
            if (height < self.variable.frameDefaultHeight) {
                if (frameHeight != self.variable.frameDefaultHeight) {
                    self.variable.frameDom.height(self.variable.frameDefaultHeight);
                    isChanged = 'smaller than defaultHeight';
                }
            }
            else if (height != frameHeight) {
                self.variable.frameDom.height(height);
                isChanged = 'not equal ' + height + ' ' + frameHeight;
            }
            if (isChanged)
                console.log('change', isChanged);
        }
    },
};
