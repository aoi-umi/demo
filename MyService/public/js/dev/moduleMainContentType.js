/**
 * Created by bang on 2017-9-11.
 */

(function (factory) {
    namespace('moduleMainContentType', factory(require, {}));
})(function (require, exports) {
    exports.init = function (option) {
        var self = this;
        var opt = {
            operation: ['query', 'save', 'del', 'detailQuery'],
            queryId: 'search',
            queryItemTempId: 'mainContentTypeItem',
            queryContainerId: 'list',

            detailId: 'detail',
            detailContainerName: 'detailContainer',
            detailTempId: 'mainContentTypeSaveTemp',

            saveClass: 'save',
            saveDefaultModel: {
                id: 0,
                type: '',
                typeName: '',
                parentType: '',
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
                    if (val && !myVaild.isInt(val, '001'))
                        return '请输入正确的正整数';
                }
            }, {
                name: 'type',
                dom: $('#type'),
            }, {
                name: 'typeName',
                dom: $('#typeName'),
            }, {
                name: 'parentType',
                dom: $('#parentType'),
            }, {
                name: 'level',
                dom: $('#level'),
                checkValue: function (val) {
                    if (val && !myVaild.isInt(val, '001'))
                        return '请输入正确的正整数';
                }
            }],
            bindEvent: function () {
                $('#tree').on('click', function () {
                    var data = {};
                    var method = 'mainContentTypeQuery';
                    myInterface[method](data).then(function (t) {
                        var rootTree = {};
                        var itemTree = {};
                        $('.tree').empty();
                        var list = _.sortBy(t.list, function (n) {
                            return -n.level;
                        });

                        function setTree(tree, parentType, list) {
                            $(list).each(function (i, item) {
                                if (!itemTree[item.type])
                                    itemTree[item.type] = {item: item, inRoot: false};
                                if (item.parentType == parentType) {
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
                                val.item.type += '(' + val.item.parentType + ')';
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
                self.opt.updateView(['mainContentTypeDetail'], {mainContentTypeDetail: item}, self);
                self.detailDom.modal('show');
            },
            beforeSave: function (dom, self) {
                var list = [{
                    name: 'id',
                    dom: self.detailContainerDom.find('[name=id]'),
                }, {
                    name: 'type',
                    dom: self.detailContainerDom.find('[name=type]'),
                    canNotNull: true,
                }, {
                    name: 'typeName',
                    dom: self.detailContainerDom.find('[name=typeName]'),
                }, {
                    name: 'parentType',
                    dom: self.detailContainerDom.find('[name=parentType]'),
                }, {
                    name: 'level',
                    dom: self.detailContainerDom.find('[name=level]'),
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
                            self.detailDom.modal('hide');
                            self.pager.refresh();
                        }
                    }]
                });
            },
            onDetailQuerySuccess: function (t, self) {
                self.detailRender(t);
                self.opt.updateView(['mainContentTypeDetail'], {mainContentTypeDetail: t}, self);
                self.detailDom.modal('show');
            },
            updateView: function (list, opt, self) {
                if (!list || common.isInArray('mainContentTypeDetail', list)) {
                    if (opt.mainContentTypeDetail) {
                        self.detailDom.find('.title').html(opt.mainContentTypeDetail.id ? ('修改:' + opt.mainContentTypeDetail.id) : '新增');
                        if (common.isInArray('save', opt.mainContentTypeDetail.operation)) {
                            self.detailDom.find('.footer').show();
                        } else {
                            self.detailDom.find('.footer').hide();
                        }
                    }
                }
            }
        };
        opt = $.extend(opt, option);
        return new module(opt);
    };
    return exports;
});