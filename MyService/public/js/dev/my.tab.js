/**
 * Created by bang on 2017-9-21.
 */
namespace('my.tab')
my.tab = {
    opt: {
        tabContainer: 'myTab',
        panelContainer: 'myPanel',
        closeBtnTemplate: '<button name="tab-close-btn" type="button" class="close hidden" data-close-target="" aria-hidden="true" style="margin-left: 5px;">&times;</button>'
    },
    init: function (option) {
        var self = this;
        self.opt = $.extend(self.opt, option);
        self.bindEvent();
    },
    bindEvent: function () {
        var self = this;
        $(document).on('click', '.tab', function () {
            var clickTab = $(this);
            var targetId = clickTab.attr('data-tab-target');
            if (targetId) {
                var tab = 'tab-' + targetId;
                var tabName = clickTab.attr('data-tab-name') || targetId;
                var tabParent = 'parent-' + tab;
                var panel = 'panel-' + targetId;
                var closeTarget = '#' + tabParent + ',' + '#' + panel;
                var tabDom = $('#' + tab);
                if (tabDom.length == 0) {
                    var tabData =
                    {
                        id: tab,
                        parentId: tabParent,
                        targetId: panel,
                        name: tabName,
                        closeTarget: closeTarget
                    };
                    var tabParentDom = self.tab(tabData);
                    tabDom = tabParentDom.find('#' + tab);
                    //console.log(html)
                    $('#' + self.opt.tabContainer).append(tabParentDom);
                    //tabDom.addClass('active').siblings('.active').removeClass('active');
                }
                var panelDom = $('#' + panel);
                if (panelDom.length == 0) {
                    var panelData = {
                        id: panel,
                        url: clickTab.data('url')
                    };
                    panelDom = self.panel(panelData);
                    $('#' + self.opt.panelContainer).append(panelDom);
                }
                tabDom.click();
            }
        });
        $(document).on('click', '#' + self.opt.tabContainer + ' .close', function () {
            if($('#' + self.opt.tabContainer + '> .active').length == 0) {
                $('#' + self.opt.tabContainer + ' a:eq(0)').click();
            }
        });
    },
    //tabData {type:'', id:'', name:'', targetId:'', closeTarget:''}
    tab: function (data) {
        var self = this;
        var dom = null;
        var t = data;
        switch (t.type) {
            case 0:
            default:
                var dom =
                    $(`<li id="${t.parentId || ''}">
                            <a id="${t.id || ''}" data-toggle="tab" href="#${t.targetId}">${t.name}
                            ${t.closeTarget ? self.opt.closeBtnTemplate : ''}</a>
                        </li>`);


                if (t.closeTarget) {
                    dom.find('[name=tab-close-btn]').removeClass('hidden').attr('data-close-target', t.closeTarget);
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
    //panelData {type:'', id:''}
    panel: function (data) {
        var self = this;
        var dom = null;
        var t = data;
        switch (t.type) {
            case 0:
            default:
                dom = $(`<div style="height: 512px" id="${t.id || ''}" class="tab-pane fade"><iframe src="${t.url || ''}" width="100%" height="100%" frameborder="no"></iframe></div>`);
                break;
        }
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
    }
}