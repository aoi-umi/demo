/**
 * Created by bang on 2017-9-11.
 */
import * as ejs from 'ejs';
import * as $ from 'jquery';
import 'bootstrap-datetimepicker';

import * as common from './common';
import * as myInterface from './myInterface';
import * as myVaild from './myVaild';
import {MyModule, ModuleOption} from './myModule';

export class ModuleMainContent extends MyModule {
    mainContentTypeList: Array<any>;

    constructor(option?: ModuleOption) {
        var opt: ModuleOption = {
            operation: [],
            interfacePrefix: 'mainContent',
            detailUrl: '/mainContent/detail',

            init: function (self: ModuleMainContent) {
                self.opt.queryArgsOpt = [{
                    name: 'type',
                    dom: $(`${self.queryBoxId} [name=typeBox]`),
                    getValue: function () {
                        var val = [];
                        this.dom.find('.type:checked').each(function () {
                            val.push($(this).val());
                        });
                        return val.join(',');
                    }
                }, {
                    name: 'status',
                    dom: $(`${self.queryBoxId} [name=statusBox]`),
                    getValue: function () {
                        var val = [];
                        this.dom.find('.status:checked').each(function () {
                            val.push($(this).val());
                        });
                        return val.join(',');
                    }
                }, {
                    name: 'user',
                    dom: $(`${self.queryBoxId} [name=user]`),
                }, {
                    name: 'title',
                    dom: $(`${self.queryBoxId} [name=title]`),
                }, {
                    name: 'createDateStart',
                    dom: $(`${self.queryBoxId} [name=createDateStart]`),
                }, {
                    name: 'createDateEnd',
                    dom: $(`${self.queryBoxId} [name=createDateEnd]`),
                }, {
                    name: 'operateDateStart',
                    dom: $(`${self.queryBoxId} [name=operateDateStart]`),
                }, {
                    name: 'operateDateEnd',
                    dom: $(`${self.queryBoxId} [name=operateDateEnd]`),
                }, {
                    name: 'operator',
                    dom: $(`${self.queryBoxId} [name=operator]`),
                }, {
                    name: 'id',
                    dom: $(`${self.queryBoxId} [name=id]`),
                    checkValue: function (val) {
                        if (val && !myVaild.isInt(val, '001'))
                            return '请输入正确的正整数';
                    }
                },]
                self.variable.delMainContentChildList = [];
                if (self.operation.detailQuery) {
                }
            },
            bindEvent: function (self: ModuleMainContent) {
                if (self.operation.query) {
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

                    $(`${self.queryBoxId} [name=operateDateStart]`)
                        .datetimepicker(dateOpt)
                        .on('click', function () {
                            $(this).datetimepicker('setEndDate', $(`${self.queryBoxId} [name=operateDateEnd]`).val() || maxDate);
                        });
                    $(`${self.queryBoxId} [name=operateDateEnd]`)
                        .datetimepicker(dateOpt)
                        .on('click', function () {
                            $(this).datetimepicker('setStartDate', $(`${self.queryBoxId} [name=operateDateStart]`).val() || minDate);
                        });                    

                    $(document).on('click', '.statusSearch', function () {
                        var status = $(this).find('.statusCount').data('status');
                        $('[name=statusBox] .status').prop('checked', false);
                        if (status !== '') {
                            $(`[name=statusBox] .status[value=${status}]`).prop('checked', true);
                        }
                        self.queryDom.click();
                    });
                }

                $(document).on('click', '.statusUpdate', function () {
                    self.statusUpdate($(this));
                });

                if (self.operation.detailQuery) {
                    $(document).on('click', '#mainContentChildList .itemDel', function () {
                        var row = $(this).closest(self.rowClass);
                        var item = row.data('item');
                        if (item.id)
                            self.variable.delMainContentChildList.push(item.id);
                        row.remove();
                        self.updateView(['mainContentChild']);
                    });

                    $(document).on('click', '#mainContentChildList .itemEdit', function () {
                        self.setMainContentChildDetail($(this).closest(self.rowClass).data('item'));
                        $('#mainContentChild').modal('show');
                    });
                    $('#mainContentChildList').on('click', '.moveUp, .moveDown', function () {
                        var dom = $(this);
                        var row;
                        var secondRow;
                        if (dom.hasClass('moveUp')) {
                            row = dom.closest(self.rowClass)
                            secondRow = row.prev(self.rowClass);
                        }
                        else {
                            secondRow = dom.closest(self.rowClass)
                            row = secondRow.next(self.rowClass);
                        }
                        if (row.length && secondRow.length) {
                            row.after(secondRow);
                            self.updateView(['mainContentChild']);
                        }
                    });

                    $('#showMainContentChild').on('click', function () {
                        self.setMainContentChildDetail(null);
                        $('#mainContentChild').modal('show');
                    });
                    $('#addMainContentChild').on('click', function () {
                        var mainContentChildDetailDom = $('#mainContentChildDetail');
                        var argsOpt = [{
                            name: 'type',
                            dom: mainContentChildDetailDom.find('[name=type]'),
                        }, {
                            name: 'content',
                            dom: mainContentChildDetailDom.find('[name=content]'),
                            canNotNull: true
                        }];
                        var checkRes = common.dataCheck({list: argsOpt});
                        if (!checkRes.success) {
                            common.msgNotice({
                                type: checkRes.dom ? 0 : 1,
                                msg: checkRes.desc,
                                dom: checkRes.dom,
                            });
                        } else {
                            var item = checkRes.model;
                            var dataItem = mainContentChildDetailDom.data('item');
                            delete dataItem.stringify;
                            item = $.extend(dataItem, item);
                            item.stringify = JSON.stringify(item);
                            var temp = $('#mainContentChildItem').html();
                            var replaceDom = $('#mainContentChildList').find(`[data-num=${item.num}]`);
                            if (!replaceDom.length)
                                $('#mainContentChildList').append(ejs.render(temp, item));
                            else
                                replaceDom.after(ejs.render(temp, item)).remove();
                            $('#mainContentChild').modal('hide');
                        }
                    });
                    //
                    let template = $('.mainContentType:eq(0)').prop('outerHTML');
                    if (template) {
                        let setOption = function (parentType?, index?) {
                            let optionHtml = [];
                            if (!index)
                                index = 0;
                            self.mainContentTypeList.forEach(ele => {
                                if ((!index && !ele.parentType) || (index && ele.parentType && parentType == ele.parentType))
                                    optionHtml.push(`<option value="${ele.type}" data-id="${ele.id}">${ele.type}${ele.typeName
                                        ? '(' + ele.typeName + ')' : ''}</option>`);
                            });

                            let dom = $(`.mainContentType:eq(${index})`);
                            if (optionHtml.length && !dom.length) {
                                dom = $(template);
                                $(`.mainContentType:eq(${index - 1})`).after(dom);
                            }
                            if (dom.length) {
                                if (optionHtml.length)
                                    optionHtml.unshift('<option value=""></option>');
                                dom.find('select').html(optionHtml.join(''));
                            }

                            //移除空的select
                            if (!optionHtml.length && index - 1 >= 0)
                                index--;
                            $(`.mainContentType:gt(${index})`).remove();
                        }
                        $('#refreshMainContentType').on('click', function () {
                            $('#mainContentType .msg').text('');
                            myInterface.api.mainContentTypeQuery({status: 1}).then((t) => {
                                self.mainContentTypeList = t.list;
                                setOption();
                            }).catch(e => {
                                $('#mainContentType .msg').text(e.message);
                            });
                        });
                        $('#refreshMainContentType').trigger('click');

                        $('#mainContentType').on('change', '.mainContentType select', function () {
                            let dom = $(this);
                            let box = dom.closest('.mainContentType');
                            setOption(dom.val(), box.index() + 1);
                        });
                    }
                }
            },
            beforeQuery: function (data) {
                $('.statusSearch').closest('li').removeClass('active');
                common.deleteIfEmpty(data);
                if (!data.status) {
                    $('.statusCount[data-status=""]').closest('li').addClass('active');
                } else {
                    $(data.status.split(',')).each(function () {
                        $('.statusCount[data-status=' + this + ']').closest('li').addClass('active');
                    });
                }
            },
            onQuerySuccess: function (t) {
                $('.statusCount').text(0);
                var totalCount = 0;
                if (t.statusList) {
                    $(t.statusList).each(function () {
                        var item: any = this;
                        $(`.statusCount[data-status=${item.status}]`).text(item.count);
                        totalCount += item.count;
                    });
                }
                $(`.statusCount[data-status=""]`).text(totalCount);
            },
            beforeSave: function (dom, self) {
                var saveArgsOpt = [{
                    name: 'id',
                    desc: 'id',
                    dom: $('#id'),
                }, {
                    name: 'title',
                    desc: '标题',
                    dom: $('#title'),
                    canNotNull: true,
                }, {
                    name: 'description',
                    desc: '描述',
                    dom: $('#description'),
                    canNotNull: true,
                }];
                var detail: any = {};
                var checkRes = common.dataCheck({list: saveArgsOpt});
                if (checkRes.success) {
                    var mainContent =
                        detail.mainContent = checkRes.model;
                    var operate = dom.data('operate');
                    if (operate == 'save')
                        mainContent.status = 0;
                    else if (operate == 'submit')
                        mainContent.status = 1;
                    else
                        throw new Error(`错误的操作类型[${operate}]`);

                    if (mainContent.id == 0) {
                        let valList = [];
                        $('#mainContentType .mainContentType option:selected').each(function () {
                            let id = $(this).data('id');
                            id && valList.push(id);
                        });
                        detail.mainContentTypeList = valList;
                    }

                    detail.mainContentChildList = [];
                    $(`#mainContentChildList>${self.rowClass}`).each(function () {
                        detail.mainContentChildList.push($(this).data('item'));
                    });
                    if (!detail.mainContentChildList.length) {
                        throw new Error('请添加内容');
                    }
                    detail.delMainContentChildList = self.variable.delMainContentChildList;
                    detail.remark = $('#remark').val();
                    checkRes.model = detail;
                }
                return checkRes;
            },
            onSaveSuccess: function (t, self) {
                common.msgNotice({
                    type: 1, msg: '保存成功:' + t, btnOptList: {
                        content: '确认',
                        cb: function () {
                            location.reload(true);
                        }
                    }
                });
            },
            onDetailQuerySuccess: function (t, self) {
            },
        };
        opt = $.extend(opt, option);
        super(opt);
    }

    setMainContentChildDetail(item) {
        let self = this;
        var mainContentChildDetailDom = $('#mainContentChildDetail');
        if (!item) {
            mainContentChildDetailDom.data('item', {num: $(`#mainContentChildList ${self.rowClass}`).length + 1});
            mainContentChildDetailDom.find(':input').val('');
            mainContentChildDetailDom.find('option:eq(0)').prop('selected', true);
        } else {
            mainContentChildDetailDom.data('item', item);
            mainContentChildDetailDom.find('[name=content]').val(item.content);
            mainContentChildDetailDom.find(`[name=type] option[value=${item.type}]`).prop('selected', true);
        }
    }

    updateView(updateList) {
        let self = this;
        if (!updateList || common.isInArray('mainContentChild', updateList)) {
            $(`#mainContentChildList ${self.rowClass}`).each(function (index) {
                var row = $(this);
                var val = index + 1;
                row.attr('data-num', val);
                row.data('item').num = val;
                row.find('[name=num]').text(val);
            });
        }
    }

    statusUpdate(dom) {
        let self = this;
        var mainContent: any = {id: dom.data('id')};
        return common.promise(function () {
            var operate = dom.data('operate');
            mainContent.operate = operate;
            var operateList = ['audit', 'pass', 'notPass', 'del', 'recovery'];
            if (!common.isInArray(operate, operateList))
                throw new Error(`错误的操作类型[${operate}]`);
            var detail = {
                mainContent: mainContent,
                remark: $('#remark').val()
            };
            var notice = common.msgNotice({type: 1, msg: '处理中', noClose: true});
            return myInterface.api.mainContentStatusUpdate(detail).then(function () {
                common.msgNotice({
                    type: 1, msg: '处理成功!', btnOptList: {
                        content: '确认',
                        cb: function () {
                            self.onStatusUpdateSuccess();
                        }
                    }
                });
            }).finally(function () {
                notice.close();
            });
        }).fail(function (e) {
            if (e && e.message)
                e = e.message;
            common.msgNotice({
                type: 1, msg: '处理失败:' + e, btnOptList: {
                    content: '确认',
                    cb: function () {
                    }
                }
            });
            throw e;
        });
    }

    onStatusUpdateSuccess() {
        let self = this;
        if (self.operation.query)
            self.queryDom.click();
        else
            location.reload(true);
    }
}