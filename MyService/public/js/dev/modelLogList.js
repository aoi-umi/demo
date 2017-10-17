/**
 * Created by bang on 2017-9-11.
 */
namespace('modelLogList');
var modelLogList = {
    pager: null,
    init: function () {
        var self = this;
        self.bindEvent();
        self.pager = new my.pager({
            changeHandle: function (cb) {
                self.query().then(function (t) {
                    cb({count: t.count});
                }).fail(function () {
                    cb();
                });
            }
        });
        $('#search').click();
    },
    queryArgs: [{
        name: 'id',
        dom: $('#log_id'),
        checkValue: function (val) {
            if (val && !val.match(/^[\d]+$/))
                return '请输入正确的正整数';
        }
    }, {
        name: 'create_date_start',
        dom: $('#log_create_date_start'),
    }, {
        name: 'create_date_end',
        dom: $('#log_create_date_end'),
    }, {
        name: 'url',
        dom: $('#log_url'),
    }, {
        name: 'guid',
        dom: $('#log_guid'),
    }],
    bindEvent: function () {
        var self = this;
        $('#log_create_date_start').on('click', function () {
            var datePickerArgs = {
                el: this,
                //startDate: '#{%y-30}-01-01',
                doubleCalendar: true,
                dateFmt: 'yyyy-MM-dd',
                minDate: '1900-01-01',
                maxDate: '#F{$dp.$D(\'log_create_date_end\')}',
            };
            WdatePicker(datePickerArgs);
        });
        $('#log_create_date_end').on('click', function () {
            var datePickerArgs = {
                el: this,
                //startDate: minDate || '#{%y-30}-01-01',
                doubleCalendar: true,
                dateFmt: 'yyyy-MM-dd',
                minDate: '#F{$dp.$D(\'log_create_date_start\')||\'1900-01-01\'}',
                maxDate: '',
            };
            WdatePicker(datePickerArgs);
        });

        $('#search').on('click', function () {
            self.pager.gotoPage(1);
        });

        $('#logList').on('click', '.itemToggle', function () {
            var dom = $(this);
            var content = dom.closest('.itemRow').find('.itemConetnt');
            if (dom.hasClass('dropup')) {
                dom.removeClass('dropup');
                content.slideUp();
            } else {
                dom.addClass('dropup');
                content.slideDown();
            }
        });
        $(self.queryArgs).each(function(){
            var item = this;
            if(item.dom){
                item.dom.on('blur', function(){
                    var checkRes = extend.dataCheck({list: [item]});
                    if(checkRes.success){
                        $('[data-target="' + checkRes.dom.selector + '"]').hide();
                    }else{
                        extend.msgNotice({target: checkRes.dom.selector, msg: checkRes.desc});
                    }
                });
            }
        });
    },
    query: function () {
        var self = this;
        var list = self.queryArgs;
        var checkRes = extend.dataCheck({list: list});
        if (!checkRes.success) {
            if (checkRes.dom) {
                extend.msgNotice({target: checkRes.dom.selector, msg: checkRes.desc});
                checkRes.dom.focus();
            } else {
                alert(checkRes.desc);
            }
            return $.Deferred().reject();
        }
        var data = checkRes.model;
        $('#logList').removeClass('error');
        if (!data.id) data.id = null;
        if (!data.create_date_start) data.create_date_start = null;
        if (!data.create_date_end) data.create_date_end = null;
        data.page_index = self.pager.pageIndex;
        data.page_size = self.pager.pageSize;

        return my.interface.logQuery(data).then(function (t) {
            $('#logList .item').remove();
            var temp = $('#logItem').html();
            $(t.list).each(function (i) {
                var item = this;
                item.colNum = i + 1;
                $('#logList').append(ejs.render(temp, item));
            });
            return t;
        }).fail(function (e) {
            $('#logList .itemRow').remove();
            if (e instanceof Error) e = e.message;
            if (typeof e == 'object') e = JSON.stringify(e);
            $('#logMsg').html(e);
            $('#logList').addClass('error');
        });
    },
}