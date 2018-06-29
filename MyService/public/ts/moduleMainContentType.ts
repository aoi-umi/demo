/**
 * Created by bang on 2017-9-11.
 */

import * as ejs from 'ejs';
import * as $ from 'jquery';

import * as common from './common';
import * as myInterface from './myInterface';
import * as myVaild from './myVaild';
import {MyModule, ModuleOption} from './myModule';

interface ModuleMainContentTypeOption extends ModuleOption {
    treeItemId?: string;
}

export class ModuleMainContentType extends MyModule {
    treeItemId: string;
    treeItemTemp: string;

    constructor(option?: ModuleMainContentTypeOption) {
        var opt: ModuleMainContentTypeOption = {
            operation: ['query', 'save', 'del', 'detailQuery'],
            treeItemId: 'treeItem',
            saveClass: 'save',
            saveDefaultModel: {
                id: 0,
                type: '',
                typeName: '',
                parentType: '',
                level: 0,
                operation: ['save']
            },

            interfacePrefix: 'mainContentType',
            init: function (self: ModuleMainContentType) {
                let idList = [
                    'treeItemId',
                ];

                $(idList).each(function () {
                    let ele: any = this;
                    if (self.opt[ele])
                        self[ele] = '#' + self.opt[ele];
                    else
                        self[ele] = '';
                });
                self.treeItemTemp = $(self.treeItemId).html();

                self.opt.queryArgsOpt = [{
                    name: 'id',
                    dom: $(`${self.queryBoxId} [name=id]`),
                    checkValue: function (val) {
                        if (val && !myVaild.isInt(val, '001'))
                            return '请输入正确的正整数';
                    }
                }, {
                    name: 'type',
                    dom: $(`${self.queryBoxId} [name=type]`),
                }, {
                    name: 'typeName',
                    dom: $(`${self.queryBoxId} [name=typeName]`),
                }, {
                    name: 'parentType',
                    dom: $(`${self.queryBoxId} [name=parentType]`),
                }, {
                    name: 'level',
                    dom: $(`${self.queryBoxId} [name=level]`),
                    checkValue: function (val) {
                        if (val && !myVaild.isInt(val, '001'))
                            return '请输入正确的正整数';
                    }
                }];
            },
            bindEvent: function (self: ModuleMainContentType) {
                $('#tree, #treeRefresh').on('click', function () {
                    if ($(this).attr('id') == 'tree') {
                        $('#treeModal').modal('show');
                    }
                    var data = {};
                    myInterface.api.mainContentTypeQuery(data).then(function (t) {
                        $('.tree').empty();
                        var list = t.list.sort(function (a, b) {
                            return b.level - a.level;
                        });
                        let tree = common.getTree(list, '', null, 'type', 'parentType');
                        let itemTree = tree.itemTree;
                        var rootTree = tree.rootTree;
                        var temp = self.treeItemTemp;

                        function renderTree(leave, treeDom) {
                            leave.item.inRoot = leave.inRoot;
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
                                renderTree(val, $('#notInRootTreeList'));
                            }
                        }
                    })
                });

                $('#treeModal').on('click', '.itemDetailQuery', function () {
                    var row = $(this).closest(self.rowClass);
                    self.detailQuery(row.data('item'));
                });

                $('#treeModal').on('click', '.itemDel', function () {
                    var row = $(this).closest(self.rowClass);
                    self.del(row.data('item'));
                });

                $('#treeModal').on('click', '.itemAdd', function () {
                    var row = $(this).closest(self.rowClass);
                    let item = row.data('item');
                    item = $.extend(null, self.opt.saveDefaultModel, item ? {parentType: item.type} : null);
                    self.edit(item);
                });
            },
            editAfterRender: function (item, self: ModuleMainContentType) {
                self.updateView(['mainContentTypeDetail'], {mainContentTypeDetail: item});
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
            onDetailQuerySuccess: function (t, self: ModuleMainContentType) {
                self.detailRender(t);
                self.updateView(['mainContentTypeDetail'], {mainContentTypeDetail: t});
                self.detailDom.modal('show');
            },
        };
        opt = $.extend(opt, option);
        super(opt);
    }

    updateView(list, opt) {
        let self = this;
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
}