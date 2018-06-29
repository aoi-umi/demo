/**
 * Created by bang on 2017-9-11.
 */
import * as $ from 'jquery';
import 'bootstrap-datetimepicker';

import * as myVaild from './myVaild';
import {MyModule, ModuleOption} from './myModule';

export class ModuleLog extends MyModule {
    constructor(option?: ModuleOption) {
        var opt: ModuleOption = {
            operation: ['query'],
            interfacePrefix: 'log',

            init: function (self: ModuleLog) {
                self.opt.queryArgsOpt = [{
                    name: 'id',
                    dom: $(`${self.queryBoxId} [name=id]`),
                    checkValue: function (val) {
                        if (val && !myVaild.isInt(val, '001'))
                            return '请输入正确的正整数';
                    }
                }, {
                    name: 'url',
                    dom: $(`${self.queryBoxId} [name=url]`),
                }, {
                    name: 'result',
                    dom: $(`${self.queryBoxId} [name=result]`),
                    getValue: function () {
                        return this.dom.filter(':checked').val();
                    }
                }, {
                    name: 'application',
                    dom: $(`${self.queryBoxId} [name=application]`),
                }, {
                    name: 'method',
                    dom: $(`${self.queryBoxId} [name=method]`),
                }, {
                    name: 'methodName',
                    dom: $(`${self.queryBoxId} [name=methodName]`),
                }, {
                    name: 'code',
                    dom: $(`${self.queryBoxId} [name=code]`),
                }, {
                    name: 'createDateStart',
                    dom: $(`${self.queryBoxId} [name=createDateStart]`),
                }, {
                    name: 'createDateEnd',
                    dom: $(`${self.queryBoxId} [name=createDateEnd]`),
                    getValue: function () {
                        let val = this.dom.val();
                        return val ? val + ' 23:59:59' : '';
                    }
                }, {
                    name: 'url',
                    dom: $(`${self.queryBoxId} [name=url]`),
                }, {
                    name: 'guid',
                    dom: $(`${self.queryBoxId} [name=guid]`),
                }, {
                    name: 'req',
                    dom: $(`${self.queryBoxId} [name=req]`),
                }, {
                    name: 'res',
                    dom: $(`${self.queryBoxId} [name=res]`),
                }, {
                    name: 'remark',
                    dom: $(`${self.queryBoxId} [name=remark]`),
                }];
            },
            bindEvent: function (self: ModuleLog) {
                let minDate = '1900-01-01';
                let maxDate = '9999-12-31';
                let dateOpt = {
                    format: 'yyyy-mm-dd',
                    minView: 'month',
                    autoclose: true,
                    todayBtn: true,
                    clearBtn: true,
                    startDate: minDate,
                };
                $(`${self.queryBoxId} [name=createDateStart]`)
                    .datetimepicker(dateOpt)
                    .on('click', function () {
                        $(this).datetimepicker('setEndDate', $(`${self.queryBoxId} [name=createDateEnd]`).val() || maxDate);
                    });
                $(`${self.queryBoxId} [name=createDateEnd]`)
                    .datetimepicker(dateOpt)
                    .on('click', function () {
                        $(this).datetimepicker('setStartDate', $(`${self.queryBoxId} [name=createDateStart]`).val() || minDate);
                    });

                self.queryContainerDom.on('click', '.itemToggle', function () {
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
            }
        };

        opt = $.extend(opt, option);
        super(opt);
    }
}