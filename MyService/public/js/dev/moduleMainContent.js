/**
 * Created by bang on 2017-9-11.
 */
namespace('moduleMainContent');
moduleMainContent = {
    init: function (option) {
        var self = this;
        var opt = {
            mainContentDetailUrl: '/mainContent/detail',
            //module参数
            operation: [],
            queryId: 'search',
            queryItemTempId: 'mainContentItem',
            queryContainerId: 'list',

            detailContainerId: 'detailContainer',
            detailTempId: 'mainContentSaveTemp',

//            rowClass: 'itemRow',
//            editClass: 'itemEdit',
            interfacePrefix: 'mainContent',
            queryArgsOpt: [{
                name: 'type',
                dom: $('[name=typeBox]'),
                getValue: function () {
                    var val = [];
                    this.dom.find('.type:checked').each(function () {
                        val.push($(this).val());
                    });
                    return val.join(',');
                }
            }, {
                name: 'status',
                dom: $('[name=statusBox]'),
                getValue: function () {
                    var val = [];
                    this.dom.find('.status:checked').each(function () {
                        val.push($(this).val());
                    });
                    return val.join(',');
                }
            }, {
                name: 'user',
                dom: $('#user'),
            }, {
                name: 'title',
                dom: $('#title'),
            }, {
                name: 'create_date_start',
                dom: $('#create_date_start'),
            }, {
                name: 'create_date_end',
                dom: $('#create_date_end'),
            }, {
                name: 'operate_date_start',
                dom: $('#operate_date_start'),
            }, {
                name: 'operate_date_end',
                dom: $('#operate_date_end'),
            }, {
                name: 'operator',
                dom: $('#operator'),
            },{
                name: 'id',
                dom: $('#id'),
                checkValue: function (val) {
                    if (val && !my.vaild.isInt(val, '001'))
                        return '请输入正确的正整数';
                }
            }, ],
            init: function (self) {
                self.variable.delMainContentChildList = [];
                self.variable.defaultMainCotentChild = {
                    id: 0,
                    num: 0,
                    type: 0,
                    content: ''
                };
                if (self.operation.detailQuery) {
                }
            },
            bindEvent: function (self) {
                if (self.operation.query) {
                    $('#create_date_start').on('click', function () {
                        var datePickerArgs = {
                            el: this,
                            //startDate: '#{%y-30}-01-01',
                            doubleCalendar: true,
                            dateFmt: 'yyyy-MM-dd',
                            minDate: '1900-01-01',
                            maxDate: '#F{$dp.$D(\'create_date_end\')}',
                        };
                        WdatePicker(datePickerArgs);
                    });
                    $('#create_date_end').on('click', function () {
                        var datePickerArgs = {
                            el: this,
                            //startDate: minDate || '#{%y-30}-01-01',
                            doubleCalendar: true,
                            dateFmt: 'yyyy-MM-dd',
                            minDate: '#F{$dp.$D(\'create_date_start\')||\'1900-01-01\'}',
                            maxDate: '',
                        };
                        WdatePicker(datePickerArgs);
                    });

                    $('#operate_date_start').on('click', function () {
                        var datePickerArgs = {
                            el: this,
                            //startDate: '#{%y-30}-01-01',
                            doubleCalendar: true,
                            dateFmt: 'yyyy-MM-dd',
                            minDate: '1900-01-01',
                            maxDate: '#F{$dp.$D(\'operate_date_end\')}',
                        };
                        WdatePicker(datePickerArgs);
                    });
                    $('#operate_date_end').on('click', function () {
                        var datePickerArgs = {
                            el: this,
                            //startDate: minDate || '#{%y-30}-01-01',
                            doubleCalendar: true,
                            dateFmt: 'yyyy-MM-dd',
                            minDate: '#F{$dp.$D(\'operate_date_start\')||\'1900-01-01\'}',
                            maxDate: '',
                        };
                        WdatePicker(datePickerArgs);
                    });
                    var toDetail = [self.addClass, self.detailQueryClass].join(',');
                    //打开detail页
                    $(document).on('click', toDetail, function () {
                        var dom = $(this);
                        var args = {
                            id: 0,
                            noNav: true
                        };
                        if (dom.hasClass(self.opt.addClass)) {
                        } else {
                            args.id = dom.closest(self.rowClass).data('item').id;
                        }
                        var url = self.opt.mainContentDetailUrl + '?';

                        if (parent && parent.my && parent.my.tab) {
                            var params = common.getUrlParamsFromArgs(args);
                            var data = {
                                id: 'mainContentDetail' + args.id,
                                name: args.id == 0 ? '新增内容' : '内容:' + args.id,
                                content: url + params
                            };
                            parent.my.tab.addOrOpenTab(data);
                        }
                        else {
                            args.noNav = false;
                            var params = common.getUrlParamsFromArgs(args);
                            window.open(url + params);
                        }
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
                    self.opt.statusUpdate($(this), self);
                });

                if (self.operation.detailQuery) {
                    $(document).on('click', '#mainContentChildList .itemDel', function () {
                        var row = $(this).closest(self.rowClass);
                        var item = row.data('item');
                        if (item.id)
                            self.variable.delMainContentChildList.push(item.id);
                        row.remove();
                        self.opt.updateView(['mainContentChild'], self);
                    });

                    $(document).on('click', '#mainContentChildList .itemEdit', function () {
                        self.opt.setMainContentChildDetail($(this).closest(self.rowClass).data('item'), self);
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
                            self.opt.updateView(['mainContentChild'], self);
                        }
                    });

                    $('#showMainContentChild').on('click', function () {
                        self.opt.setMainContentChildDetail(null, self);
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
                }
            },
            beforeQuery: function (data) {
                $('.statusSearch').closest('li').removeClass('active');
                if (!data.id) data.id = null;
                if (!data.type) data.type = null;
                if (!data.status) {
                    data.status = null;
                    $('.statusCount[data-status=""]').closest('li').addClass('active');
                } else {
                    $(data.status.split(',')).each(function () {
                        $('.statusCount[data-status=' + this + ']').closest('li').addClass('active');
                    });
                }
                if (!data.create_date_start) data.create_date_start = null;
                if (!data.create_date_end) data.create_date_end = null;
                if (!data.operate_date_start) data.operate_date_start = null;
                if (!data.operate_date_end) data.operate_date_end = null;
            },
            onQuerySuccess: function (t) {
                $('.statusCount').text(0);
                var totalCount = 0;
                if (t.status_list) {
                    $(t.status_list).each(function () {
                        var item = this;
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
                var detail = {};
                var checkRes = common.dataCheck({list: saveArgsOpt});
                if (checkRes.success) {
                    var main_content =
                        detail.main_content = checkRes.model;
                    var operate = dom.data('operate');
                    if (operate == 'save')
                        main_content.status = 0;
                    else if (operate == 'submit')
                        main_content.status = 1;
                    else
                        throw new Error(`错误的操作类型[${operate}]`);
                    detail.main_content_child_list = [];
                    $(`#mainContentChildList>${self.rowClass}`).each(function () {
                        detail.main_content_child_list.push($(this).data('item'));
                    });
                    if (!detail.main_content_child_list.length) {
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

            getDefaultMainCotentChild: function (self) {
                return self.variable.defaultMainCotentChild;
            },
            setMainContentChildDetail: function (item, self) {
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
            },
            updateView: function (updateList, self) {
                if (!updateList || common.isInArray('mainContentChild', updateList)) {
                    $(`#mainContentChildList ${self.rowClass}`).each(function (index) {
                        var row = $(this);
                        var val = index + 1;
                        row.attr('data-num', val);
                        row.data('item').num = val;
                        row.find('[name=num]').text(val);
                    });
                }
            },

            statusUpdate: function (dom, self) {
                var main_content = {id: dom.data('id')};
                return common.promise().then(function () {
                    try {
                        var operate = dom.data('operate');
                        main_content.operate = operate;
                        var operateList = ['audit', 'pass', 'notPass', 'del', 'recovery'];
                        if (!common.isInArray(operate, operateList))
                            throw new Error(`错误的操作类型[${operate}]`);
                        var detail = {
                            main_content: main_content,
                            remark: $('#remark').val()
                        };
                        var notice = common.msgNotice({type: 1, msg: '处理中', noClose: true});
                        return my.interface['mainContentStatusUpdate'](detail).then(function () {
                            common.msgNotice({
                                type: 1, msg: '处理成功!', btnOptList: {
                                    content: '确认',
                                    cb: function () {
                                        self.opt.onStatusUpdateSuccess(self);
                                    }
                                }
                            });
                        }).always(function () {
                            notice.close();
                        });
                    }
                    catch (e) {
                        return $.Deferred().reject(e);
                    }
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
                });
            },
            onStatusUpdateSuccess: function (self) {
                if (self.operation.query)
                    self.queryDom.click();
                else
                    location.reload(true);
            }
        };
        opt = $.extend(opt, option);
        return new module(opt);
    }
};