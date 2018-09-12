/**
 * Created by bang on 2017-9-11.
 */
import * as $ from 'jquery';

import * as common from './common';
import * as myVaild from './myVaild';
import {MyModuleGeneric, ModuleOptionGeneric} from './myModule';
import {AuthorityAutoComplete} from './autoComplete';

interface ModuleRoleOption extends ModuleOptionGeneric<ModuleRole> {
    mainContentId?: number;
}
export class ModuleRole extends MyModuleGeneric<ModuleRole, ModuleRoleOption> {
    currRoleCode: string;
    authorityAutoComplete: AuthorityAutoComplete;

    constructor(option?: ModuleRoleOption) {
        var opt: ModuleRoleOption = {
            operation: ['query', 'save', 'detailQuery'],
            queryId: 'query',
            queryItemTempId: 'itemTemp',

            detailId: 'detail',
            detailContainerName: 'detailContainer',
            detailTempId: 'detailTemp',

            rowClass: 'itemRow',
            interfacePrefix: 'role',

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
                },]
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

            editAfterRender: function (item, self) {
                self.updateView(['roleDetail'], {roleDetail: item});
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
                        content: '关闭', 
                        returnValue: 'close',                        
                    }]
                }).waitClose().then(val => {
                    if(val == 'close') {
                        self.detailDom.modal('hide');
                        self.pager.refresh();
                    }
                });
            },
            beforeDetailQuery: function (t, self) {
                return {code: t.code};
            },
            onDetailQuerySuccess: function (t, self) {
                self.detailRender(t.role);
                self.currRoleCode = t.role.code;
                self.updateView(['roleDetail'], {roleAllDetail: t});
                self.detailDom.modal('show');
            },
            editBeforeRender: function (data, self) {
                self.currRoleCode = null;
                return data;
            },
        };

        opt = $.extend(opt, option);
        super(opt);
    }

    updateView(list, opt) {
        let self = this;
        if (!list || common.isInArray('roleDetail', list)) {
            self.setAuthorityAutoComplete();

            if (opt.roleAllDetail) {
                opt.roleDetail = opt.roleAllDetail.role;
                opt.roleDetail.operation = opt.roleAllDetail.operation;
                $(opt.roleAllDetail.authorityList).each(function (i, item) {
                    self.authorityAutoComplete.setAuthority(item);
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
    }

    setAuthorityAutoComplete() {
        let self = this;
        self.authorityAutoComplete = new AuthorityAutoComplete({
            dom: self.detailContainerDom.find('[name=authority]'),
            renderDom: self.detailContainerDom.find('[name=authorityBox]'),
            labelName: 'roleAuthority'
        });

        self.authorityAutoComplete.excludeByRoleCode = self.currRoleCode;
    }
}