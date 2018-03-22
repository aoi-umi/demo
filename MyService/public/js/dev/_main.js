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

(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", 'jquery', 'jquery.cookie', 'jquery-ui', 'ejs', , 'bootstrap',
            'config', 'socket', 'common', 'sign', 'my.enum', 'my.interface'], factory);
    } else {
        let exports = {};
        window.main = factory(require, exports);
    }
})(function (require, exports) {
    let $ = require('jquery');
    let config = require('config');
    let common = require('common');
    let my = require('my');

    exports.variable = {
        frameDom: null,
        frameDefaultHeight: 0,
    };

    exports.init = function () {
        let socket = require('socket');
        var self = this;
        ejs.open = '{%';
        ejs.close = '%}';

        var userInfo = $.cookie(config.cacheKey.userInfo);
        if (!userInfo) {
            userInfo = common.guid();
        }
        $.cookie(config.cacheKey.userInfo, userInfo, {expires: 30});

        if (parent == window)
            socket.init();
        my.interface.init({
            interfaceConfig: {
                signUp: {
                    url: '/interface/sign/up'
                },
                signIn: {
                    url: '/interface/sign/in'
                },
                signOut: {
                    url: '/interface/sign/out'
                },
                logQuery: {
                    url: '/interface/log/query'
                },
                onlineUserQuery: {
                    url: '/interface/onlineUser/query'
                },
                onlineUserDetailQuery: {
                    url: '/interface/onlineUser/detailQuery'
                },
                mainContentStatusUpdate: {
                    url: '/interface/mainContent/statusUpdate'
                },
                userInfoAdminSave: {
                    url: '/interface/userInfo/adminSave'
                },
            },
            moduleList: [
                'mainContent',
                'mainContentType',
                'userInfo',
                'authority',
                'role',
            ]
        });
        sign.init();
        $(`.nav.navbar-nav a[href="${location.pathname}"]`).closest('li').addClass('active');

        self.bindEvent();

        my.enum.enumDict = {};
    };

    exports.bindEvent = function () {
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

        //auto complete
        $(document).on('keyup', '.ui-menu-item', function (event) {
            if (event.keyCode === $.ui.keyCode.ENTER) {
                $(this).click();
                return false;
            }
        })
        //浮动
        $(document).on('mouseover mouseleave', '.hover', function (e) {
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
            var iframe = $(parent.document).find('#' + args.iframeId);
            var dom = iframe;
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
    };

    exports.updateView = function (list) {
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
    };
    return exports;
});
