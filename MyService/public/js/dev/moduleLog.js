/**
 * Created by bang on 2017-9-11.
 */
(function (factory) {
    namespace('moduleLog', factory(require, {}));
})(function (require, exports) {
    exports.init = function (option) {
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
                dom: $('#id'),
                checkValue: function (val) {
                    if (val && !myVaild.isInt(val, '001'))
                        return '请输入正确的正整数';
                }
            }, {
                name: 'url',
                dom: $('#url'),
            }, {
                name: 'result',
                dom: $('#queryBox'),
                focusDom: $('#queryBox [name=result]'),
                getValue: function () {
                    return this.dom.find('[name=result]:checked').val();
                }
            }, {
                name: 'method',
                dom: $('#method'),
            }, {
                name: 'code',
                dom: $('#code'),
            }, {
                name: 'createDateStart',
                dom: $('#createDateStart'),
            }, {
                name: 'createDateEnd',
                dom: $('#createDateEnd'),
            }, {
                name: 'url',
                dom: $('#url'),
            }, {
                name: 'guid',
                dom: $('#guid'),
            }, {
                name: 'req',
                dom: $('#req'),
            }, {
                name: 'res',
                dom: $('#res'),
            }, {
                name: 'remark',
                dom: $('#remark'),
            }],
            bindEvent: function (self) {
                $('#createDateStart').on('click', function () {
                    var datePickerArgs = {
                        el: this,
                        //startDate: '#{%y-30}-01-01',
                        doubleCalendar: true,
                        dateFmt: 'yyyy-MM-dd',
                        minDate: '1900-01-01',
                        maxDate: '#F{$dp.$D(\'createDateEnd\')}',
                    };
                    WdatePicker(datePickerArgs);
                });
                $('#createDateEnd').on('click', function () {
                    var datePickerArgs = {
                        el: this,
                        //startDate: minDate || '#{%y-30}-01-01',
                        doubleCalendar: true,
                        dateFmt: 'yyyy-MM-dd',
                        minDate: '#F{$dp.$D(\'createDateStart\')||\'1900-01-01\'}',
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
                if (!data.createDateStart) data.createDateStart = null;
                if (!data.createDateEnd) data.createDateEnd = null;
            }
        };
        opt = $.extend(opt, option);
        return new module(opt);
    };
    return exports;
});