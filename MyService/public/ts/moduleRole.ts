/**
 * Created by bang on 2017-9-11.
 */
import * as ejs from 'ejs';
import * as $ from 'jquery';

import * as common from './common';
import * as myInterface from './myInterface';
import * as myVaild from './myVaild';
import {MyModule, ModuleOption} from './myModule';
import {AuthorityAutoComplete} from './autoComplete';

class ModuleRoleOption extends ModuleOption {
    currRoleCode: string;
    authorityAutoComplete?: AuthorityAutoComplete;

    updateView?(list: string[], opt, self: MyModule);

    setAuthorityAutoComplete?(self: MyModule);

    setAuthority?(opt, self: MyModule);
}

export class ModuleRole extends MyModule {
    constructor(option?: ModuleRoleOption) {
        var opt: ModuleRoleOption = {
            operation: ['query', 'save', 'detailQuery'],
            queryId: 'query',
            queryItemTempId: 'itemTemp',
            queryContainerId: 'list',

            detailId: 'detail',
            detailContainerName: 'detailContainer',
            detailTempId: 'detailTemp',

            rowClass: 'itemRow',
            interfacePrefix: 'role',
            currRoleCode: null,

            saveDefaultModel: {
                id: 0,
                code: '',
                name: '',
                status: 1,
                operation: ['save']
            },
            queryArgsOpt: [{
                name: 'id',
                dom: $('#id'),
                checkValue: function (val) {
                    if (val && !myVaild.isInt(val, '001'))
                        return '请输入正确的正整数';
                }
            }, {
                name: 'code',
                dom: $('#code'),
            }, {
                name: 'name',
                dom: $('#name'),
            }, {
                name: 'status',
                dom: $('#queryBox'),
                focusDom: $('#queryBox [name=status]'),
                getValue: function () {
                    return this.dom.find('[name=status]:checked').val();
                }
            }, {
                name: 'anyKey',
                dom: $('#anyKey'),
            },],
            init: function (self) {
            },
            bindEvent: function (self) {
                if (self.operation.detailQuery) {
                    self.detailContainerDom.on('click', '[name=roleAuthority]', function () {
                        var dom = $(this);
                        var changeDom = dom.find('[name=change]');
                        var changeStatus = dom.data('changeStatus');
                        var newStatus = changeStatus;
                        switch (changeStatus) {
                            case 0:
                                newStatus = -2;
                                break;
                            case -2:
                                newStatus = 0;
                                break;
                            case 1:
                                newStatus = -1;
                                break;
                            case -1:
                                newStatus = 1;
                                break;
                        }
                        if (newStatus >= 0) {
                            changeDom.addClass('glyphicon-remove');
                            dom.removeClass('label-warning');
                        }
                        else {
                            changeDom.removeClass('glyphicon-remove');
                            dom.addClass('label-warning');
                        }
                        dom.data('changeStatus', newStatus);
                    });
                }
            },
            beforeQuery: function (data) {
                let deleteIfNullList = [
                    'id', 'code', 'name', 'status', 'anyKey',
                ];
                deleteIfNullList.forEach(key => {
                    if (!data[key])
                        delete data[key];
                });
            },

            editAfterRender: function (item, self) {
                let selfOpt = self.opt as ModuleRoleOption;
                selfOpt.updateView(['roleDetail'], {roleDetail: item}, self);
                self.detailDom.modal('show');
            },
            beforeSave: function (dom, self) {
                if (dom.hasClass('itemStatusUpdate')) {
                    var row = dom.closest(self.rowClass);
                    var item = row.data('item');
                    let checkRes = {
                        success: true,
                        model: {
                            role: {
                                id: item.id,
                                status: item.status == 1 ? 0 : 1
                            },
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
                        desc: '角色编号',
                        dom: self.detailContainerDom.find('[name=code]'),
                        canNotNull: true,
                        checkValue: function (val) {
                            if (!myVaild.isRole(val))
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
                    if (checkRes.success) {
                        var data = {
                            role: checkRes.model,
                            addAuthorityList: [],
                            delAuthorityList: [],
                        };
                        self.detailContainerDom.find('[name=roleAuthority]').each(function () {
                            var dom = $(this);
                            var code = dom.data('code');
                            var changeStatus = dom.data('changeStatus');
                            if (changeStatus == 1)
                                data.addAuthorityList.push(code);
                            else if (changeStatus == -2)
                                data.delAuthorityList.push(code);
                        });
                        checkRes.model = data;
                    }
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
            beforeDetailQuery: function (t, self) {
                return {code: t.code};
            },
            onDetailQuerySuccess: function (t, self) {
                let selfOpt = self.opt as ModuleRoleOption;
                self.detailRender(t.role);
                selfOpt.currRoleCode = t.role.code;
                selfOpt.updateView(['roleDetail'], {roleAllDetail: t}, self);
                self.detailDom.modal('show');
            },
            editBeforeRender: function (data, self) {
                let selfOpt = self.opt as ModuleRoleOption;
                selfOpt.currRoleCode = null;
                return data;
            },

            updateView: function (list, opt, self) {
                let selfOpt = self.opt as ModuleRoleOption;
                if (!list || common.isInArray('roleDetail', list)) {
                    selfOpt.setAuthorityAutoComplete(self);

                    if (opt.roleAllDetail) {
                        opt.roleDetail = opt.roleAllDetail.role;
                        opt.roleDetail.operation = opt.roleAllDetail.operation;
                        $(opt.roleAllDetail.authorityList).each(function (i, item) {
                            selfOpt.setAuthority(item, self);
                        });
                    }
                    if (opt.roleDetail) {
                        self.detailDom.find('.footer').hide();
                        var role = opt.roleDetail;
                        self.detailDom.find('.title').html(role.id ? ('修改:' + role.id) : '新增');
                        if (common.isInArray('save', opt.roleDetail.operation)) {
                            self.detailDom.find('.footer').show();
                        }
                    }
                }
            },
            setAuthorityAutoComplete: function (self) {
                let selfOpt = self.opt as ModuleRoleOption;
                selfOpt.authorityAutoComplete = new AuthorityAutoComplete({
                    dom: () => {
                        return self.detailContainerDom.find('[name=authority]')
                    },
                    renderDom: () => {
                        return self.detailContainerDom.find('[name=authorityBox]')
                    },
                    labelName: 'roleAuthority'
                });
                
                selfOpt.authorityAutoComplete.excludeByRoleCode = selfOpt.currRoleCode;
                return selfOpt.authorityAutoComplete;
            },
            setAuthority(item, self) {
                // let selfOpt = self.opt as ModuleRoleOption;
                // selfOpt.setAuthorityAutoComplete(self).setAuthority(item);
            }
        };

        opt = $.extend(opt, option);
        super(opt);
    }
}