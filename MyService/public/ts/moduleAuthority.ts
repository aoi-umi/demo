/**
 * Created by bang on 2017-9-11.
 */
import * as $ from 'jquery';

import * as common from './common';
import * as myVaild from './myVaild';
import {MyModule, ModuleOption} from './myModule';

export class ModuleAuthority extends MyModule {
    constructor(option?: ModuleOption) {
        var opt: ModuleOption = {
            operation: ['query', 'save', 'detailQuery'],
            interfacePrefix: 'authority',
            saveDefaultModel: {
                id: 0,
                code: '',
                name: '',
                status: 1,
                operation: ['save']
            },
            init: function (self: ModuleAuthority) {
                self.opt.queryArgsOpt = [{
                    name: 'id',
                    dom: $(`${self.queryBoxId} [name=id]`),
                    checkValue: function (val) {
                        if (val && !myVaild.isInt(val, '001'))
                            return '请输入正确的正整数';
                    }
                }, {
                    name: 'code',
                    dom: $(`${self.queryBoxId} [name=code]`),
                }, {
                    name: 'name',
                    dom: $(`${self.queryBoxId} [name=name]`),
                }, {
                    name: 'status',
                    dom: $(`${self.queryBoxId} [name=status]`),
                    getValue: function () {
                        return this.dom.filter(':checked').val();
                    }
                }, {
                    name: 'anyKey',
                    dom: $(`${self.queryBoxId} [name=anyKey]`),
                },];
            },

            editAfterRender: function (item, self: ModuleAuthority) {
                self.updateView(['authorityDetail'], {authorityDetail: item});
                self.detailDom.modal('show');
            },
            beforeSave: function (dom, self) {
                //启用/禁用
                if (dom.hasClass('itemStatusUpdate')) {
                    var row = dom.closest(self.rowClass);
                    var item = row.data('item');
                    let checkRes = {
                        success: true,
                        model: {
                            id: item.id,
                            status: item.status == 1 ? 0 : 1,
                            statusUpdateOnly: true
                        }
                    };
                    return checkRes;
                } else {
                    var list = [{
                        name: 'id',
                        dom: self.detailContainerDom.find('[name=id]'),
                    }, {
                        name: 'code',
                        desc: '权限编号',
                        dom: self.detailContainerDom.find('[name=code]'),
                        canNotNull: true,
                        checkValue: function (val) {
                            if (!myVaild.isAuthority(val))
                                return '{0}只能由字母、数字、下划线组成';
                        }
                    }, {
                        name: 'name',
                        dom: self.detailContainerDom.find('[name=name]'),
                    }, {
                        name: 'status',
                        dom: self.detailContainerDom.find('[name=status]'),
                        getValue: function () {
                            return this.dom.prop('checked');
                        }
                    },];
                    let checkRes = common.dataCheck({list: list});
                    return checkRes;
                }
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
            onDetailQuerySuccess: function (t, self: ModuleAuthority) {
                self.detailRender(t);
                self.updateView(['authorityDetail'], {authorityDetail: t});
                self.detailDom.modal('show');
            },
        };

        opt = $.extend(opt, option);
        super(opt);
    }

    updateView(list, opt) {
        let self = this;
        if (!list || common.isInArray('authorityDetail', list)) {
            if (opt.authorityDetail) {
                var authority = opt.authorityDetail;
                self.detailDom.find('.title').html(authority.id ? ('修改:' + authority.id) : '新增');
                if (common.isInArray('save', opt.authorityDetail.operation)) {
                    self.detailDom.find('.footer').show();
                } else {
                    self.detailDom.find('.footer').hide();
                }
            }
        }
    }
}