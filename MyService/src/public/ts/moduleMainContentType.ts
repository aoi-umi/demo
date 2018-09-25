/**
 * Created by bang on 2017-9-11.
 */

import * as ejs from 'ejs';
import * as $ from 'jquery';

import * as common from './common';
import * as myInterface from './myInterface';
import * as myVaild from './myVaild';
import { MyModuleGeneric, ModuleOptionGeneric } from './myModule';
import { Tree } from './tree';

interface ModuleMainContentTypeOption extends ModuleOptionGeneric<ModuleMainContentType> {
    treeItemId?: string;
}

export class ModuleMainContentType extends MyModuleGeneric<ModuleMainContentType, ModuleMainContentTypeOption> {
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
            idList: [
                'treeItemId',
            ],
            interfacePrefix: 'mainContentType',
            init: function (self) {
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
            bindEvent: function (self) {
                $('#tree, #treeRefresh').on('click', function () {
                    if ($(this).attr('id') == 'tree') {
                        $('#treeModal').modal('show');
                    }
                    var data = {};
                    myInterface.api.mainContentType.query(data).then(function (t) {
                        var list = t.list.sort(function (a, b) {
                            return b.level - a.level;
                        });
                        Tree.renderTree(list, self.treeItemTemp);
                    });
                });

                let treeModal = $('#treeModal');
                treeModal.on('click', self.detailQueryClass, function () {
                    var row = $(this).closest(self.rowClass);
                    self.detailQuery(row.data('item'));
                });

                treeModal.on('click', self.delClass, function () {
                    var row = $(this).closest(self.rowClass);
                    self.del(row.data('item'));
                });

                treeModal.on('click', '.itemAdd', function () {
                    var row = $(this).closest(self.rowClass);
                    let item = row.data('item');
                    item = $.extend(null, self.opt.saveDefaultModel, item ? { parentType: item.type } : null);
                    self.edit(item);
                });
            },
            editAfterRender: function (item, self) {
                self.updateView(['mainContentTypeDetail'], { mainContentTypeDetail: item });
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
                var checkRes = common.dataCheck({ list: list });
                return checkRes;
            },
            onSaveSuccess: function (t, self) {
                common.msgNotice({
                    type: 1, msg: '保存成功:' + t,
                    btnOptList: [{
                        content: '继续'
                    }, {
                        content: '关闭',
                        returnValue: 'close',
                    }]
                }).waitClose().then(val => {
                    if (val == 'close') {
                        self.detailDom.modal('hide');
                        self.pager.refresh();
                    }
                });
            },
            onDetailQuerySuccess: function (t, self) {
                self.detailRender(t);
                self.updateView(['mainContentTypeDetail'], { mainContentTypeDetail: t });
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