/**
 * Created by bang on 2017-4-17.
 */
$(window).resize(function () {
    var height = document.documentElement.clientHeight - $('#navbar').height() - 100;
    if (height < 500) height = 500;
    $('#memcacheIframe').height(height);
});

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

var tabControl = {
    opt: {
        tabContainer: 'myTab',
        panelContainer: 'myPanel'
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
                    var tabData = [
                        {
                            id: tab,
                            parentId: tabParent,
                            targetId: panel,
                            name: tabName,
                            closeTarget: closeTarget
                        }
                    ];
                    var tabhtml = self.tab(tabData);
                    //console.log(html)
                    $('#' + self.opt.tabContainer).append(tabhtml);
                    tabDom = $('#' + tab);
                    //tabDom.addClass('active').siblings('.active').removeClass('active');
                }
                var panelDom = $('#' + panel);
                if (panelDom.length == 0) {
                    var panelData = [{
                        id: panel
                    }];
                    var panelhtml = self.panel(panelData);
                    $('#' + self.opt.panelContainer).append(panelhtml);
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
    //tabData [{type:'', id:'', name:'', targetId:'', closeTarget:''}]
    tab: function (data) {
        var self = this;
        var html = [];
        for (var i = 0; i < data.length; i++) {
            var t = data[i];
            switch (t.type) {
                case 0:
                default:
                    html.push('<li' + ( t.parentId ? ' id="' + t.parentId + '"' : '') + '>');
                    html.push('<a ' + ( t.id ? ' id="' + t.id + '"' : '') + ' data-toggle="tab" href="#'
                        + t.targetId + '" aria-expanded="false">' + t.name);
                    if (t.closeTarget) {
                        html.push('<button type="button" class="close" data-close-target="' + t.closeTarget
                            + '" aria-hidden="true" style="margin-left: 5px;">&times;</button>');
                    }
                    html.push('</a>');
                    html.push('</li>');
                    break;
            }
        }
        return html.join('');
    },
    //panelData {type:'', id:''}
    panel: function (data) {
        var self = this;
        var html = [];
        for (var i = 0; i < data.length; i++) {
            var t = data[i];
            switch (t.type) {
                case 0:
                default:
                    html.push('<div ' + (t.id ? ' id="' + t.id + '"' : '') + ' class="tab-pane fade">');
                    html.push(t.id ? t.id : '');
                    html.push('</div>');
                    break;
            }
        }
        return html.join('');
    }
}