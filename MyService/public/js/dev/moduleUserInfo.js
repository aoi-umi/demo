/**
 * Created by bang on 2017-9-11.
 */
namespace('moduleUserInfo');
moduleUserInfo = {
    init: function (option) {
        var self = this;
        var opt = {
            operation: ['query'],
            queryId: 'search',
            queryItemTempId: 'itemTemp',
            queryContainerId: 'list',

            rowClass: 'itemRow',
            interfacePrefix: 'userInfo',

            queryArgsOpt: [{
                name: 'id',
                dom: $('#id'),
                checkValue: function (val) {
                    if (val && !my.vaild.isInt(val, '001'))
                        return '请输入正确的正整数';
                }
            }, {
                name: 'account',
                dom: $('#account'),
            }, {
                name: 'nickname',
                dom: $('#nickname'),
            }, {
                name: 'auth',
                dom: $('#auth'),
            }, {
                name: 'create_datetime_start',
                dom: $('#create_datetime_start'),
            }, {
                name: 'create_datetime_end',
                dom: $('#create_datetime_end'),
            }, {
                name: 'edit_datetime_start',
                dom: $('#edit_datetime_start'),
            }, {
                name: 'edit_datetime_end',
                dom: $('#edit_datetime_end'),
            }
            ],
            bindEvent: function (self) {
                $('#create_datetime_start').on('click', function () {
                    var datePickerArgs = {
                        el: this,
                        //startDate: '#{%y-30}-01-01',
                        doubleCalendar: true,
                        dateFmt: 'yyyy-MM-dd',
                        minDate: '1900-01-01',
                        maxDate: '#F{$dp.$D(\'create_datetime_end\')}',
                    };
                    WdatePicker(datePickerArgs);
                });
                $('#create_datetime_end').on('click', function () {
                    var datePickerArgs = {
                        el: this,
                        //startDate: minDate || '#{%y-30}-01-01',
                        doubleCalendar: true,
                        dateFmt: 'yyyy-MM-dd',
                        minDate: '#F{$dp.$D(\'create_datetime_start\')||\'1900-01-01\'}',
                        maxDate: '',
                    };
                    WdatePicker(datePickerArgs);
                });


                $('#edit_datetime_start').on('click', function () {
                    var datePickerArgs = {
                        el: this,
                        //startDate: '#{%y-30}-01-01',
                        doubleCalendar: true,
                        dateFmt: 'yyyy-MM-dd',
                        minDate: '1900-01-01',
                        maxDate: '#F{$dp.$D(\'edit_datetime_end\')}',
                    };
                    WdatePicker(datePickerArgs);
                });
                $('#edit_datetime_end').on('click', function () {
                    var datePickerArgs = {
                        el: this,
                        //startDate: minDate || '#{%y-30}-01-01',
                        doubleCalendar: true,
                        dateFmt: 'yyyy-MM-dd',
                        minDate: '#F{$dp.$D(\'edit_datetime_start\')||\'1900-01-01\'}',
                        maxDate: '',
                    };
                    WdatePicker(datePickerArgs);
                });
            },
            beforeQuery: function (data) {
                if (!data.id) data.id = null;
                if (!data.account) data.account = null;
                if (!data.nickname) data.nickname = null;
                if (!data.auth) data.auth = null;
                if (!data.create_datetime_start) data.create_datetime_start = null;
                if (!data.create_datetime_end) data.create_datetime_end = null;
                if (!data.edit_datetime_start) data.edit_datetime_start = null;
                if (!data.edit_datetime_end) data.edit_datetime_end = null;
            }
        };
        opt = $.extend(opt, option);
        return new module(opt);
    },
}