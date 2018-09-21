import 'jquery.cookie';
import 'bootstrap';

import * as common from './common';
import * as socket from './socket';
import * as myInterface from './myInterface';
import { MyEnum } from './myEnum';
import * as user from './user';

export let variable = {
    frameDom: null,
    frameDefaultHeight: 0,
};

class MainContentStatusEnumOperate {
    提交: "submit" = "submit";
    审核: "audit" = "audit";
    通过: "pass" = "pass";
    不通过: "notPass" = "notPass";
    删除: "del" = "del";
    恢复: "recovery" = "recovery";
}

class StructTypeEnum {
    公司: "company" = "company";
    部门: "department" = "department";
    小组: "group" = "group";
}
let enumDict = {
    structTypeEnum: new StructTypeEnum(),
    mainContentStatusEnumOperate: new MainContentStatusEnumOperate(),
}
export let myEnum = MyEnum.createInstance(enumDict);
export let init = function () {
    var userInfo = $.cookie(cacheKey.userInfo);
    if (!userInfo) {
        userInfo = common.guid();
    }
    $.cookie(cacheKey.userInfo, userInfo, { expires: 30 });

    if (parent == window)
        socket.init();
    myInterface.init({
        interfaceConfig: {
            signUp: {
                url: '/interface/user/signUp'
            },
            signIn: {
                url: '/interface/user/signIn'
            },
            signOut: {
                url: '/interface/user/signOut'
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
            captchaGet: {
                url: '/interface/captcha/get'
            },
            logStatistics: {
                url: '/interface/log/statistics'
            },
        },
        moduleList: [
            'log',
            'mainContent',
            'mainContentType',
            'mainContentLog',
            'userInfo',
            'userInfoLog',
            'authority',
            'role',
            'struct',
        ]
    });
    user.init();
    $(`.nav.navbar-nav a[href="${location.pathname}"]`).closest('li').addClass('active');

    bindEvent();
};

export let bindEvent = function () {
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
        var dom = $(this) as any as JQuery<HTMLElement>;
        var target = $(dom.attr('href'));
        if (target.length && dom.hasClass('hover-source')) {
            target.css({ 'left': dom.position().left, 'margin-top': '0px' });
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
            variable.frameDom = dom;
            variable.frameDefaultHeight = args.height || 512;
            $(window).on('load resize mousemove', function (e) {
                updateView(['scroll']);
            });
        }
    }
};

export let updateView = function (list) {
    if (!list || common.isInArray('scroll', list)) {
        var height = $('body').outerHeight(true);
        var isChanged = '';
        var frameHeight = variable.frameDom.height();
        if (height < variable.frameDefaultHeight) {
            if (frameHeight != variable.frameDefaultHeight) {
                variable.frameDom.height(variable.frameDefaultHeight);
                isChanged = 'smaller than defaultHeight';
            }
        }
        else if (height != frameHeight) {
            variable.frameDom.height(height);
            isChanged = 'not equal ' + height + ' ' + frameHeight;
        }
        if (isChanged)
            console.log('change', isChanged);
    }
};

export let cacheKey = {
    userInfo: 'userInfoCacheKey'
};
