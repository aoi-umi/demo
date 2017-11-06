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

            saveId: 'save',
            saveDefaultModel: {
                id: 0,
                type: '',
                status: '',
                user_info_id: '',
                title: '',
                desc: '',
                create_date: '',
                operate_date: '',
                operator: '',
            },
            addId: 'add',

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
                    console.log(common.getArgsFromUrlParams());
                }
            },
            bindEvent: function (self) {
                if (self.operation.query) {
                    var toDetail = [self.addId, self.detailQueryClass].join(',');
                    $(document).on('click', toDetail, function () {
                        var dom = $(this);
                        var args = {
                            id: 0,
                            noNav: true
                        };
                        if (dom.attr('id') == self.opt.addId) {
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
                        self.variable.delMainContentChildList.push(row.data('item').id);
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
            beforeSave: function () {
            },
            onSaveSuccess: function (t, self) {
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