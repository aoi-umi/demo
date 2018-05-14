/**
 * Created by bang on 2017-9-11.
 */
(function (factory) {
    namespace('main', factory(require, {}));
})(function (require, exports) {
    exports.variable = {
        frameDom: null,
        frameDefaultHeight: 0,
    };

    exports.init = function () {
        var self = this;
        ejs.open = '{%';
        ejs.close = '%}';

        var userInfo = $.cookie(main.cacheKey.userInfo);
        if (!userInfo) {
            userInfo = common.guid();
        }
        $.cookie(main.cacheKey.userInfo, userInfo, {expires: 30});

        if (parent == window)
            socket.init();
        myInterface.init({
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

        myEnum.enumDict = {};
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
        //更多
        $(document).on('click', '.more-toggle', function (e) {
            var dom = $(this);
            dom.next('.more').toggle();
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

    exports.cacheKey = {
        userInfo: 'userInfoCacheKey'
    };
    return exports;
});
