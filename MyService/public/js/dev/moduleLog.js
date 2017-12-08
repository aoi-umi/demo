/**
 * Created by bang on 2017-9-11.
 */
namespace('moduleLog');
moduleLog = {
    init: function (option) {
        var self = this;
        var opt = {
            operation: ['query'],
            queryId: 'search',
            queryItemTempId: 'logItemTemp',
            queryContainerId: 'logList',

            rowClass: 'itemRow',
            interfacePrefix: 'log',

            queryArgsOpt: [{
                name: 'id',
                dom: $('#log_id'),
                checkValue: function (val) {
                    if (val && !my.vaild.isInt(val, '001'))
                        return '请输入正确的正整数';
                }
            }, {
                name: 'url',
                dom: $('#log_url'),
            }, {
                name: 'result',
                dom: $('#queryBox'),
                focusDom: $('#queryBox [name=log_result]'),
                getValue: function () {
                    return this.dom.find('[name=log_result]:checked').val();
                }
            }, {
                name: 'method',
                dom: $('#log_method'),
            }, {
                name: 'code',
                dom: $('#log_code'),
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
            }, {
                name: 'req',
                dom: $('#log_req'),
            }, {
                name: 'res',
                dom: $('#log_res'),
            }, {
                name: 'remark',
                dom: $('#log_remark'),
            }],
            bindEvent: function (self) {
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
            },
            beforeQuery: function (data) {
                if (!data.id) data.id = null;
                if (!data.result) data.result = null;
                if (!data.create_date_start) data.create_date_start = null;
                if (!data.create_date_end) data.create_date_end = null;
            }
        };
        opt = $.extend(opt, option);
        return new module(opt);
    },
}