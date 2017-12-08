/**
 * Created by bang on 2017-9-11.
 */
namespace('moduleMainContentType');
moduleMainContentType = {
    init: function (option) {
        var self = this;
        var opt = {
            operation: ['query', 'save', 'del', 'detailQuery'],
            queryId: 'search',
            queryItemTempId: 'mainContentTypeItem',
            queryContainerId: 'list',

            detailContainerId: 'detailContainer',
            detailTempId: 'mainContentTypeSaveTemp',

            saveClass: 'save',
            saveDefaultModel: {
                id: 0,
                type: '',
                type_name: '',
                parent_type: '',
                level: 0,
                operation: ['save']
            },
            addClass: 'add',

//            rowClass: 'itemRow',
//            editClass: 'itemEdit',
            interfacePrefix: 'mainContentType',
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
                name: 'type_name',
                dom: $('#type_name'),
            }, {
                name: 'parent_type',
                dom: $('#parent_type'),
            }, {
                name: 'level',
                dom: $('#level'),
                checkValue: function (val) {
                    if (val && !my.vaild.isInt(val, '001'))
                        return '请输入正确的正整数';
                }
            }],
            bindEvent: function () {
                $('#tree').on('click', function () {
                    var data = {};
                    var method = 'mainContentTypeQuery';
                    my.interface[method](data).then(function (t) {
                        var rootTree = {};
                        var itemTree = {};
                        $('.tree').empty();
                        var list = _.sortBy(t.list, function (n) {
                            return -n.level;
                        });

                        function setTree(tree, parent_type, list) {
                            $(list).each(function (i, item) {
                                if (!itemTree[item.type])
                                    itemTree[item.type] = {item: item, inRoot: false};
                                if (item.parent_type == parent_type) {
                                    itemTree[item.type].inRoot = true;
                                    if (!tree[item.type]) {
                                        tree[item.type] = {
                                            item: item,
                                            child: {}
                                        }
                                    }
                                    setTree(tree[item.type].child, item.type, list);
                                }
                            });
                        }

                        setTree(rootTree, '', list);
                        var temp = $('#mainContentTypeTreeItem').html();

                        function renderTree(leave, treeDom) {
                            var leaveDom = $(ejs.render(temp, leave.item));
                            leaveDom.data('item', leave.item);
                            treeDom.append(leaveDom);
                            if (leave.child) {
                                for (var key in leave.child) {
                                    renderTree(leave.child[key], leaveDom.find('.child:eq(0)'));
                                }
                            }
                        }

                        for (var key in rootTree) {
                            renderTree(rootTree[key], $('#treeList'));
                        }
                        for (var key in itemTree) {
                            var val = itemTree[key];
                            if (!val.inRoot) {
                                val.item.type += '(' + val.item.parent_type + ')';
                                renderTree(val, $('#notInRootTreeList'));
                            }
                        }
                    })
                });
            },
            beforeQuery: function (data) {
                if (!data.id) data.id = null;
                if (!data.level) data.level = null;
            },
            editAfterRender: function (item, self) {
                $('#mainContentTypeSave [name=title]').html(item.id ? ('修改:' + item.id) : '新增');
                self.opt.updateView(['mainContentTypeDetail'], {mainContentTypeDetail: item});
                $('#mainContentTypeSave').modal('show');
            },
            beforeSave: function () {
                var list = [{
                    name: 'id',
                    dom: $('#mainContentTypeSave [name=id]'),
                }, {
                    name: 'type',
                    dom: $('#mainContentTypeSave [name=type]'),
                    canNotNull: true,
                }, {
                    name: 'type_name',
                    dom: $('#mainContentTypeSave [name=type_name]'),
                }, {
                    name: 'parent_type',
                    dom: $('#mainContentTypeSave [name=parent_type]'),
                }, {
                    name: 'level',
                    dom: $('#mainContentTypeSave [name=level]'),
                }];
                var checkRes = common.dataCheck({list: list});
                return checkRes;
            },
            onSaveSuccess: function (t, self) {
                common.msgNotice({
                    type: 1, msg: '保存成功:' + t,
                    btnOptList: [{
                        content: '继续'
                    }, {
                        content: '关闭', cb: function () {
                            $('#mainContentTypeSave').modal('hide');
                            self.pager.refresh();
                        }
                    }]
                });
            },
            onDetailQuerySuccess: function (t, self) {
                self.detailRender(t);
                self.opt.updateView(['mainContentTypeDetail'], {mainContentTypeDetail: t});
                $('#mainContentTypeSave').modal('show');
            },
            updateView: function (list, opt, self) {
                if (!list || common.isInArray('mainContentTypeDetail', list)) {
                    if (opt.mainContentTypeDetail) {
                        if (common.isInArray('save', opt.mainContentTypeDetail.operation)) {
                            $('#mainContentTypeSave [name=footer]').show();
                        } else {
                            $('#mainContentTypeSave [name=footer]').hide();
                        }
                    }
                }
            }
        };
        opt = $.extend(opt, option);
        return new module(opt);
    }
};