/**
 * Created by bang on 2017-9-11.
 */
namespace('moduleMainContent');
moduleMainContent = {
    init: function (option) {
        var self = this;
        var opt = {
            mainContentDetailUrl: '/mainContentDetail',
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
                name: 'id',
                dom: $('#id'),
                checkValue: function (val) {
                    if (val && !my.vaild.isInt(val, '001'))
                        return '请输入正确的正整数';
                }
            }, {
                name: 'type',
                dom: $('#type'),
            }, {
                name: 'status',
                dom: $('#status'),
            }, {
                name: 'user_info_id',
                dom: $('#user_info_id'),
            }, {
                name: 'title',
                dom: $('#title'),
            }, {
                name: 'create_date',
                dom: $('#create_date'),
            }, {
                name: 'operate_date',
                dom: $('#operate_date'),
            }, {
                name: 'operator',
                dom: $('#operator'),
            }],
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
                    var toDetail = [self.addClass, self.detailQueryClass].join(',');
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

                        if (parent.my.tab) {
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
                }

                if (self.operation.detailQuery) {
                    $(document).on('click', '#mainContentChildList .itemDel', function () {
                        var row = $(this).closest('.itemRow');
                        var item = row.data('item');
                        if(item.id)
                            self.variable.delMainContentChildList.push(item.id);
                        row.remove();
                        self.opt.updateView(['mainContentChild']);
                    });

                    $(document).on('click', '#mainContentChildList .itemEdit', function () {
                        self.opt.setMainContentChildDetail($(this).closest('.itemRow').data('item'));
                        $('#mainContentChild').modal('show');
                    });
                    $('#mainContentChildList').on('click', '.moveUp, .moveDown', function () {
                        var dom = $(this);
                        var row;
                        var secondRow;
                        if (dom.hasClass('moveUp')) {
                            row = dom.closest('.itemRow')
                            secondRow = row.prev('.itemRow');
                        }
                        else {
                            secondRow = dom.closest('.itemRow')
                            row = secondRow.next('.itemRow');
                        }
                        if (row.length && secondRow.length) {
                            var item = row.data('item');
                            var changeItem = secondRow.data('item');
                            var t = item.num;
                            item.num = changeItem.num;
                            changeItem.num = t;
                            row.find('[name=num]').text(item.num);
                            secondRow.find('[name=num]').text(changeItem.num);
                            row.after(secondRow);
                        }
                    });

                    $('#showMainContentChild').on('click', function () {
                        self.opt.setMainContentChildDetail();
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
                            item.num = $('#mainContentChildList .itemRow').length + 1;
                            item.stringify = JSON.stringify(item);
                            var temp = $('#mainContentChildItem').html();
                            $('#mainContentChildList').append(ejs.render(temp, item));
                            $('#mainContentChild').modal('hide');
                        }
                    });
                }
            },
            beforeQuery: function (data) {
                if (!data.id) data.id = null;
                if (!data.type) data.type = null;
                if (!data.status) data.status = null;
                if (!data.user_info_id) data.user_info_id = null;
                if (!data.create_date) data.create_date = null;
                if (!data.operate_date) data.operate_date = null;
            },
            afterEdit: function (item) {
            },
            beforeSave: function (dom, self) {
                var saveArgsOpt = [{
                    name: 'id',
                    desc: 'id',
                    dom: $('#id'),
                },{
                    name: 'title',
                    desc: '标题',
                    dom: $('#title'),
                    canNotNull: true,
                },{
                    name: 'description',
                    desc: '描述',
                    dom: $('#description'),
                    canNotNull: true,
                }];
                var detail = {};
                var checkRes = common.dataCheck({list:saveArgsOpt});
                if(checkRes.success){
                    var main_content =
                    detail.main_content = checkRes.model;
                    var operate = dom.data('operate');
                    if(operate == 'save')
                        main_content.status = 0;
                    else if(operate == 'submit')
                        main_content.status = 1;
                    else
                        throw new Error(`错误的操作类型[${operate}]`);
                    detail.main_content_child_list = [];
                    $('#mainContentChildList>.itemRow').each(function () {
                        detail.main_content_child_list.push($(this).data('item'));
                    });
                    if(!detail.main_content_child_list.length) {
                        checkRes.success = false;
                        checkRes.desc = '请添加内容';
                    }
                    detail.delMainContentChildList = self.variable.delMainContentChildList;
                    checkRes.model = detail;
                }
                return checkRes;
            },
             onSaveSuccess: function (t, self) {
                 common.msgNotice({type: 1, msg: '保存成功:' + t, btnOptList:{
                     content:'确认',
                     cb:function(){
                         location.reload(true);
                     }
                 }});
             },
            onDetailQuerySuccess: function (t, self) {
            },

            getDefaultMainCotentChild: function (self) {
                return self.variable.defaultMainCotentChild;
            },
            setMainContentChildDetail: function (item) {
                var mainContentChildDetailDom = $('#mainContentChildDetail');
                if (!item) {
                    mainContentChildDetailDom.find(':input').val('');
                    mainContentChildDetailDom.find('option:eq(0)').prop('selected', true);
                } else {
                    mainContentChildDetailDom.find('[name=content]').val(item.content);
                    mainContentChildDetailDom.find(`[name=type] option[value=${item.type}]`).prop('selected', true);
                }
            },
            updateView: function (updateList) {
                if (!updateList || common.isInArray('mainContentChild', updateList)) {
                    $('#mainContentChildList .itemRow').each(function (index) {
                        var row = $(this);
                        var val = index + 1;
                        row.data('item').num = val;
                        row.find('[name=num]').text(val);
                    });
                }
            }
        };
        opt = $.extend(opt, option);
        return new module(opt);
    }
};