/**
 * Created by bang on 2017-9-11.
 */

import * as ejs from 'ejs';
import * as $ from 'jquery';

import * as common from './common';
import * as myInterface from './myInterface';
import * as myVaild from './myVaild';
import * as myEnum from './myEnum';
import {MyModule, ModuleOption} from './myModule';

interface ModuleStructOption extends ModuleOption {
    treeItemId?: string;
}
export class ModuleStruct extends MyModule {
    treeItemId: string;
    treeItemTemp: string;
    constructor(option?: ModuleStructOption) {
        var opt: ModuleStructOption = {
            operation: ['query', 'save', 'del', 'detailQuery'],
            treeItemId: 'treeItem',

            saveClass: 'save',
            saveDefaultModel: {
                id: 0,
                type: '',
                struct: '',
                structName: '',
                parentStruct: '',
                level: 0,
                operation: ['save']
            },
            interfacePrefix: 'struct',
            init: function(self: ModuleStruct){
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
                    name: 'struct',
                    dom: $(`${self.queryBoxId} [name=struct]`),
                }, {
                    name: 'structName',
                    dom: $(`${self.queryBoxId} [name=structName]`),
                }, {
                    name: 'parentStruct',
                    dom: $(`${self.queryBoxId} [name=parentStruct]`),
                }, {
                    name: 'level',
                    dom: $(`${self.queryBoxId} [name=level]`),
                    checkValue: function (val) {
                        if (val && !myVaild.isInt(val, '001'))
                            return '请输入正确的正整数';
                    }
                }];
            },
            bindEvent: function (self: ModuleStruct) {
                $('#tree, #treeRefresh').on('click', function () {
                    if ($(this).attr('id') == 'tree') {
                        $('#treeModal').modal('show');
                    }
                    var data = {};
                    myInterface.api.struct.query(data).then(function (t) {
                        var rootTree = {};
                        var itemTree = {};
                        $('.tree').empty();
                        var list = t.list.sort(function (a, b) {
                            return b.level - a.level;
                        });

                        function setTree(tree, parentStruct, list) {
                            $(list).each(function (i) {
                                let item: any = this;
                                if (!itemTree[item.struct])
                                    itemTree[item.struct] = {item: item, inRoot: false};
                                if (item.parentStruct == parentStruct) {
                                    itemTree[item.struct].inRoot = true;
                                    if (!tree[item.struct]) {
                                        tree[item.struct] = {
                                            item: item,
                                            child: {},
                                            inRoot: true,
                                        }
                                    }
                                    setTree(tree[item.struct].child, item.struct, list);
                                }
                            });
                        }

                        setTree(rootTree, '', list);
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
                    item = $.extend(null, self.opt.saveDefaultModel, item ? {parentStruct: item.struct} : null);
                    self.edit(item);
                });
            },
            editBeforeRender: function (item) {
                item.structTypeEnum = myEnum.getEnum('structTypeEnum');
                return item;
            },
            editAfterRender: function (item, self: ModuleStruct) {
                self.updateView(['structDetail'], {structDetail: item});
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
                    name: 'struct',
                    dom: self.detailContainerDom.find('[name=struct]'),
                    canNotNull: true,
                }, {
                    name: 'structName',
                    dom: self.detailContainerDom.find('[name=structName]'),
                    canNotNull: true,
                }, {
                    name: 'parentStruct',
                    dom: self.detailContainerDom.find('[name=parentStruct]'),
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
            onDetailQuerySuccess: function (t, self: ModuleStruct) {
                t.structTypeEnum = myEnum.getEnum('structTypeEnum');
                self.detailRender(t);
                self.updateView(['structDetail'], {structDetail: t});
                self.detailDom.modal('show');
            },
        };
        opt = $.extend(opt, option);
        super(opt);
    }

    updateView(list, opt) {
        let self = this;
        if (!list || common.isInArray('structDetail', list)) {
            if (opt.structDetail) {
                self.detailDom.find('.title').html(opt.structDetail.id ? ('修改:' + opt.structDetail.id) : '新增');
                if (common.isInArray('save', opt.structDetail.operation)) {
                    self.detailDom.find('.footer').show();
                } else {
                    self.detailDom.find('.footer').hide();
                }
            }
        }
    }
}