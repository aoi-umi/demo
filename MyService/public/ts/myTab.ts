/**
 * Created by bang on 2017-9-21.
 */

window['myTab'] = exports;

interface TabHeaderContextMenu extends JQuery<HTMLElement> {
    currTab?: JQuery<HTMLElement>;
    currTabHeader?: JQuery<HTMLElement>;
}

interface TabContextMenu extends JQuery<HTMLElement> {
    currTab?: JQuery<HTMLElement>;
}

interface MyTabInitOption {
    tabContainer?: string;
    panelContainer?: string;
    closeBtnTemplate? :string;
}
export let opt: MyTabInitOption = {
    tabContainer: 'tab',
    panelContainer: 'panel',
    closeBtnTemplate: '<button name="tab-close-btn" type="button" class="close hidden" data-close-target="" aria-hidden="true" style="margin-left: 5px;float: none"><span class="glyphicon glyphicon-remove"></span></button>'
};
export let tabContainer: JQuery<HTMLElement>;
export let panelContainer: JQuery<HTMLElement>;
export let tabHeaderContextMenu: TabHeaderContextMenu;
export let tabContextMenu: TabContextMenu;
export let clickTabIdList = [];

export let init = function (option: MyTabInitOption) {

    opt = $.extend(opt, option);
    tabContainer = $('#' + opt.tabContainer);
    panelContainer = $('#' + opt.panelContainer);
    tabHeaderContextMenu =
        $(`<ul class="dropdown-menu" id="tab-header-context-menu">
                <li><a href="javascript:;" class="menu-item" data-menu-type="refresh">刷新</a></li>
                <li class="divider"></li>
                <li><a href="javascript:;" class="menu-item" data-menu-type="close">关闭</a></li>
                <li><a href="javascript:;" class="menu-item" data-menu-type="closeAll">关闭全部</a></li>
                <li><a href="javascript:;" class="menu-item" data-menu-type="closeAllExceptThis">关闭除此之外全部</a></li>
                <li><a href="javascript:;" class="menu-item" data-menu-type="closeLeftAll">关闭左侧全部</a></li>
                <li><a href="javascript:;" class="menu-item" data-menu-type="closeRightAll">关闭右侧全部</a></li>
            </ul>`);
    $('body').append(tabHeaderContextMenu);
    tabContextMenu =
        $(`<ul class="dropdown-menu" id="tab-header-context-menu">
                <li><a href="javascript:;" class="menu-item" data-menu-type="_blank">在新标签打开</a></li>
                <li><a href="javascript:;" class="menu-item" data-menu-type="_self">在本页打开</a></li>
            </ul>`);
    $('body').append(tabContextMenu);

    bindEvent();
};
export let bindEvent = function () {
    $(document).on('click', '.tab', function (event) {
        var clickTab = $(this);
        var targetId = clickTab.attr('data-tab-target');
        if (targetId) {
            var tabId = 'tab-' + targetId;
            var tabName = clickTab.attr('data-tab-name') || targetId;
            var tabHeader = 'tab-header-' + targetId;
            var panelId = 'panel-' + targetId;
            var closeTarget = '#' + tabHeader + ',' + '#' + panelId;
            var tabDom = $('#' + tabId);
            if (tabDom.length == 0) {
                var tabData = {
                    id: tabId,
                    headerId: tabHeader,
                    targetId: panelId,
                    name: tabName,
                    closeTarget: closeTarget
                };
                var tabParentDom = tab(tabData);
                tabDom = tabParentDom.find('#' + tabId);
                //console.log(html)
                tabContainer.append(tabParentDom);
                //tabDom.addClass('active').siblings('.active').removeClass('active');
            }
            var panelDom = $('#' + panelId);
            if (panelDom.length == 0) {
                var panelData = {
                    id: panelId,
                    type: clickTab.data('tab-type'),
                    content: clickTab.data('tab-content'),
                };
                panelDom = panel(panelData);
                panelContainer.append(panelDom);
            }
            tabDom.click();
        }
    });
    //中键
    $(document).on('mousedown', '.tab[data-url]', function(event){
        let currTab = $(this);
        if(event.which == 2){
            var url = currTab.data('url');
            var type = '_blank';
            if (url && type) {
                window.open(url, type);
            }
        }
    });
    $(document).on('contextmenu', '.tab[data-url]', function (e) {
        var x = e.pageX;
        var y = e.pageY;
        tabContextMenu.css({
            left: x,
            top: y,
        }).show();
        tabContextMenu.currTab = $(this);
        return false;

    });
    tabContainer.on('click', '[data-toggle=tab]', function () {
        var id = $(this).attr('id');
        if (clickTabIdList[clickTabIdList.length - 1] != id) {
            for (let i = 0; i < clickTabIdList.length; i++) {
                if (clickTabIdList[i] == id) {
                    clickTabIdList.splice(i, 1);
                    break;
                }
            }
            clickTabIdList.push(id);
        }
    });
    //关闭
    tabContainer.on('click', '.close', function (event) {
        $($(this).data('close-target')).remove();
        clickTabIdList.pop();
        if (tabContainer.find('> .active').length == 0) {
            var lastId = clickTabIdList[clickTabIdList.length - 1];
            if (!$('#' + lastId).length)
                tabContainer.find('a:eq(0)').click();
            else
                $('#' + lastId).click();
        }
        event.stopPropagation();
    });
    //tab header右键
    tabContainer.on('contextmenu', '.tab-header', function (e) {
        var x = e.pageX;
        var y = e.pageY;
        tabHeaderContextMenu.css({
            left: x,
            top: y,
        }).show();
        tabHeaderContextMenu.currTabHeader = $(this);
        return false;
    });

    $(document).on('click', function () {
        tabHeaderContextMenu.hide();
        tabHeaderContextMenu.currTabHeader = null;
        tabContextMenu.hide();
        tabContextMenu.currTab = null;
    });
    tabHeaderContextMenu.on('click', '.menu-item', function (e) {
        var currTabHeader = tabHeaderContextMenu.currTabHeader;
        if (currTabHeader) {
            var type = $(this).data('menu-type');
            switch (type) {
                case 'refresh':
                    var iframe = $(currTabHeader.find('a').attr('href')).find('iframe');
                    if (iframe.length) {
                        iframe.attr('src', iframe.attr('src'));
                    }
                    break;
                case 'close':
                    currTabHeader.find('[name=tab-close-btn]').click();
                    break;
                case 'closeAll':
                    tabContainer.find('[name=tab-close-btn]').click();
                    break;
                case 'closeAllExceptThis':
                    currTabHeader.siblings().find('[name=tab-close-btn]').click();
                    break;
                case 'closeLeftAll':
                    currTabHeader.prevAll().find('[name=tab-close-btn]').click();
                    break;
                case 'closeRightAll':
                    currTabHeader.nextAll().find('[name=tab-close-btn]').click();
                    break;
            }
        }
    });

    tabContextMenu.on('click', '.menu-item', function (e) {
        var currTab = tabContextMenu.currTab;
        if (currTab) {
            var url = currTab.data('url');
            var type = $(this).data('menu-type');
            if (url && type) {
                window.open(url, type);
            }
        }
    });
};

export let tab = function (t: TabOption) {
    var dom = null;
    switch (t.type) {
        default:
            dom =
                $(`<li class="tab-header" id="${t.headerId || ''}">
                            <a id="${t.id || ''}" data-toggle="tab" href="#${t.targetId}">${t.name}
                            ${t.closeTarget ? opt.closeBtnTemplate : ''}</a>
                        </li>`);


            if (t.closeTarget) {
                var closeBtn = dom.find('[name=tab-close-btn]');
                closeBtn.removeClass('hidden').attr('data-close-target', t.closeTarget)
                dom.on('dblclick', function () {
                    closeBtn.click();
                });
            }
            break;
    }
    return dom;
};
export let tabs = function (data: Array<TabOption>) {
    var list = [];
    for (var i = 0; i < data.length; i++) {
        var dom = tab(data[i]);
        if (dom)
            list.push(dom);
    }
    return list;
};

export let panel = function (t: PanelOption) {
    var dom = null;
    var content = 'no content';
    switch (t.type) {
        case 'iframe':
        default:
            if (t.content) {
                var iframeId = 'iframe-' + t.id;
                if (t.content.indexOf('?') >= 0)
                    t.content += '&iframeId=' + iframeId;
                else
                    t.content += '?iframeId=' + iframeId;
                content = `<iframe id="${iframeId}" src="${t.content}" width="100%" height="100%" frameborder="no" scrolling="no"></iframe>`;
            }
            break;
        case 'template':
            content = $('#' + t.content).html();
            break;
    }

    let height = $(window).height() - ($('#navTop').height() + $('#navBottom').height() + tabContainer.height() + 40);
    if(height < 512)
        height = 512;
    dom = $(`<div style="height: ${height}px" id="${t.id || ''}" class="tab-pane fade">${content}</div>`);
    return dom;
};
export let panels = function (data: Array<PanelOption>) {
    var list = [];
    for (var i = 0; i < data.length; i++) {
        var dom = panel(data[i]);
        if (dom)
            list.push(dom);
    }
    return list;
};

export let addOrOpenTab = function (data: TabAndPanelOption) {
    var tabId = 'tab-' + data.id;
    var headerId = 'tab-header-' + data.id;
    var panelId = 'panel-' + data.id;
    var tabData = {
        id: tabId,
        name: data.name,
        headerId: headerId,
        targetId: panelId,
        closeTarget: '#' + headerId + ',#' + panelId,
    };
    if (!$('#' + tabId).length)
        tabContainer.append(tab(tabData));

    var tabPanelData = {
        type: data.type,
        id: panelId,
        content: data.content
    };
    if (!$('#' + panelId).length)
        panelContainer.append(panel(tabPanelData));
    $('#' + tabId).click();
};
