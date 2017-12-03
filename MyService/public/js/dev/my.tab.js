/**
 * Created by bang on 2017-9-21.
 */
namespace('my.tab')
my.tab = {
    opt: {
        tabContainer: 'myTab',
        panelContainer: 'myPanel',
        closeBtnTemplate: '<button name="tab-close-btn" type="button" class="close hidden" data-close-target="" aria-hidden="true" style="margin-left: 5px;float: none">&times;</button>'
    },
    tabContainer: null,
    panelContainer: null,
    tabHeaderContextMenu: null,
    clickTabIdList: [],
    init: function (option) {
        var self = this;
        self.opt = $.extend(self.opt, option);
        self.tabContainer = $('#' + self.opt.tabContainer);
        self.panelContainer = $('#' + self.opt.panelContainer);
        var tabHeaderContextMenu = self.tabHeaderContextMenu =
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

        self.bindEvent();
    },
    bindEvent: function () {
        var self = this;
        var tabContainer = self.tabContainer;
        var panelContainer = self.panelContainer;
        var tabHeaderContextMenu = self.tabHeaderContextMenu;
        $(document).on('click', '.tab', function () {
            var clickTab = $(this);
            var targetId = clickTab.attr('data-tab-target');
            if (targetId) {
                var tab = 'tab-' + targetId;
                var tabName = clickTab.attr('data-tab-name') || targetId;
                var tabHeader = 'tab-header-' + targetId;
                var panel = 'panel-' + targetId;
                var closeTarget = '#' + tabHeader + ',' + '#' + panel;
                var tabDom = $('#' + tab);
                if (tabDom.length == 0) {
                    var tabData =
                    {
                        id: tab,
                        headerId: tabHeader,
                        targetId: panel,
                        name: tabName,
                        closeTarget: closeTarget
                    };
                    var tabParentDom = self.tab(tabData);
                    tabDom = tabParentDom.find('#' + tab);
                    //console.log(html)
                    tabContainer.append(tabParentDom);
                    //tabDom.addClass('active').siblings('.active').removeClass('active');
                }
                var panelDom = $('#' + panel);
                if (panelDom.length == 0) {
                    var panelData = {
                        id: panel,
                        type: clickTab.data('tab-type'),
                        content: clickTab.data('tab-content'),
                    };
                    panelDom = self.panel(panelData);
                    panelContainer.append(panelDom);
                }
                tabDom.click();
            }
        });
        tabContainer.on('click', '[data-toggle=tab]', function(){
            var id = $(this).attr('id');
            self.clickTabIdList.push(id);
        });
        //关闭
        tabContainer.on('click','.close', function () {
            $($(this).data('close-target')).remove();
            if(tabContainer.find('> .active').length == 0) {
                var lastId = self.clickTabIdList[self.clickTabIdList.length - 2];
                if (!$('#' + lastId).length)
                    tabContainer.find('a:eq(0)').click();
                else
                    $('#' + lastId).click();
            }
        });
        //tab header右键
        tabContainer.on('contextmenu', '.tab-header', function(e){
            var x = e.clientX;
            var y = e.clientY;
            self.tabHeaderContextMenu.css({
                left: x,
                top: y,
            }).show();
            self.tabHeaderContextMenu.currTabHeader = $(this);
            return false;
        });

        $(document).on('click', function(){
            tabHeaderContextMenu.hide();
            tabHeaderContextMenu.currTabHeader = null;
        });
        tabHeaderContextMenu.on('click','.menu-item', function(e){
            var currTabHeader = tabHeaderContextMenu.currTabHeader;
            if(currTabHeader) {
                var type = $(this).data('menu-type');
                switch (type) {
                    case 'refresh':
                        var iframe = $(currTabHeader.find('a').attr('href')).find('iframe');
                        if(iframe.length){
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
    },
    //tabData {type:'', id:'', name:'', targetId:'', closeTarget:''}
    tab: function (data) {
        var self = this;
        var dom = null;
        var t = data;
        switch (t.type) {
            default:
                var dom =
                    $(`<li class="tab-header" id="${t.headerId || ''}">
                            <a id="${t.id || ''}" data-toggle="tab" href="#${t.targetId}">${t.name}
                            ${t.closeTarget ? self.opt.closeBtnTemplate : ''}</a>
                        </li>`);


                if (t.closeTarget) {
                    var closeBtn = dom.find('[name=tab-close-btn]');
                    closeBtn.removeClass('hidden').attr('data-close-target', t.closeTarget)
                    dom.on('dblclick', function(){
                        closeBtn.click();
                    });
                }
                break;
        }
        return dom;
    },
    tabs:function(data){
        var self = this;
        var list = [];
        for(var i = 0;i < data.length;i++){
            var dom = self.tab(data[i]);
            if(dom)
                list.push(dom);
        }
        return list;
    },
    //panelData {type:'', id:'', content:''}
    panel: function (data) {
        var self = this;
        var dom = null;
        var t = data;
        var content = 'no content';
        switch (t.type) {
            case 'iframe':
            default:
                if(t.content) {
                    var iframeId = 'iframe-' + t.id;
                    if(t.content.indexOf('?') >= 0)
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

        dom = $(`<div style="height: 512px" id="${t.id || ''}" class="tab-pane fade">${content}</div>`);
        return dom;
    },
    panels:function(data){
        var self = this;
        var list = [];
        for (var i = 0; i < data.length; i++) {
            var dom = self.panel(data[i]);
            if(dom)
                list.push(dom);
        }
        return list;
    },
    addOrOpenTab:function(data){
        var self = this;
        var tabContainer = self.tabContainer;
        var panelContainer = self.panelContainer;
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
        if(!$('#' + tabId).length)
            tabContainer.append(self.tab(tabData));

        var tabPanelData = {
            type: data.type,
            id: panelId,
            content: data.content
        };
        if(!$('#' + panelId).length)
            panelContainer.append(self.panel(tabPanelData));
        $('#' + tabId).click();
    }
}
