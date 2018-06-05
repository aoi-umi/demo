/**
 * Created by bang on 2017-9-11.
 */
import * as ejs from 'ejs';
import * as $ from 'jquery';
//@ts-ignore
import * as WdatePicker from 'WdatePicker';

import * as common from './common';
import * as myInterface from './myInterface';
import * as myVaild from './myVaild';
import {MyModule, ModuleOption} from './myModule';
import {AuthorityAutoComplete, RoleAutoComplete} from './autoComplete';

class ModuleUserInfoOption extends ModuleOption {
}

export class ModuleUserInfo extends MyModule {
    currUserId: number;
    currUserDetail: any;
    authorityAutoComplete: AuthorityAutoComplete;
    roleAutoComplete: RoleAutoComplete;
    structTree: any;

    constructor(option?: ModuleUserInfoOption) {
        var opt: ModuleUserInfoOption = {
            operation: ['query', 'save', 'detailQuery'],
            queryId: 'search',
            queryItemTempId: 'itemTemp',
            queryContainerId: 'list',

            rowClass: 'itemRow',
            interfacePrefix: 'userInfo',
            detailUrl: '/userInfo/detail',

            queryArgsOpt: [{
                name: 'account',
                dom: $('#account'),
            }, {
                name: 'nickname',
                dom: $('#nickname'),
            }, {
                name: 'role',
                dom: $('#role'),
            }, {
                name: 'authority',
                dom: $('#authority'),
            }, {
                name: 'createDateStart',
                dom: $('#createDateStart'),
            }, {
                name: 'createDateEnd',
                dom: $('#createDateEnd'),
            }, {
                name: 'editDateStart',
                dom: $('#editDateStart'),
            }, {
                name: 'editDateEnd',
                dom: $('#editDateEnd'),
            }, {
                name: 'id',
                dom: $('#id'),
                checkValue: function (val) {
                    if (val && !myVaild.isInt(val, '001'))
                        return '请输入正确的正整数';
                }
            },],
            init: function (self) {
                if (self.operation.query) {
                    self.detailDom.find('.save').removeClass('save').addClass('admin-save');
                }
            },
            bindEvent: function (self: ModuleUserInfo) {
                if (self.operation.query) {
                    $('#createDateStart').on('click', function () {
                        var datePickerArgs = {
                            el: this,
                            //startDate: '#{%y-30}-01-01',
                            doubleCalendar: true,
                            dateFmt: 'yyyy-MM-dd',
                            minDate: '1900-01-01',
                            maxDate: '#F{$dp.$D(\'createDateEnd\')}',
                        };
                        WdatePicker(datePickerArgs);
                    });
                    $('#createDateEnd').on('click', function () {
                        var datePickerArgs = {
                            el: this,
                            //startDate: minDate || '#{%y-30}-01-01',
                            doubleCalendar: true,
                            dateFmt: 'yyyy-MM-dd',
                            minDate: '#F{$dp.$D(\'createDateStart\')||\'1900-01-01\'}',
                            maxDate: '',
                        };
                        WdatePicker(datePickerArgs);
                    });

                    $('#editDateStart').on('click', function () {
                        var datePickerArgs = {
                            el: this,
                            //startDate: '#{%y-30}-01-01',
                            doubleCalendar: true,
                            dateFmt: 'yyyy-MM-dd',
                            minDate: '1900-01-01',
                            maxDate: '#F{$dp.$D(\'editDateEnd\')}',
                        };
                        WdatePicker(datePickerArgs);
                    });
                    $('#editDateEnd').on('click', function () {
                        var datePickerArgs = {
                            el: this,
                            //startDate: minDate || '#{%y-30}-01-01',
                            doubleCalendar: true,
                            dateFmt: 'yyyy-MM-dd',
                            minDate: '#F{$dp.$D(\'editDateStart\')||\'1900-01-01\'}',
                            maxDate: '',
                        };
                        WdatePicker(datePickerArgs);
                    });

                    $(document).on('click', '.admin-save', function () {
                        self.adminSave();
                    });
                    self.queryContainerDom.on('click', '.toggle-auth', function () {
                        var authBox = $(this).siblings('.auth-box');
                        if (authBox.hasClass('hidden'))
                            authBox.removeClass('hidden');
                        else
                            authBox.addClass('hidden');
                    });

                    //角色
                    new RoleAutoComplete({
                        dom: $('#role'),
                        select: function (dom, item) {
                            dom.data('item', item).val(item.code);
                        }
                    });

                    //权限                    
                    new AuthorityAutoComplete({
                        dom: $('#authority'),
                        select: function (dom, item) {
                            dom.data('item', item).val(item.code);
                        }
                    });
                }
                if (self.operation.detailQuery) {
                    self.detailContainerDom.on('click', '[name=userAuthority],[name=userRole]', function () {
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
                    self.detailContainerDom.on('click', '[name=refreshStruct]', function () {
                        self.structQuery().then(() => {
                            self.setStruct();
                        });
                    });
                    self.detailContainerDom.on('change', '[name=structBox] select', function () {
                        let dom = $(this);
                        let name = dom.attr('name');
                        let structTypeList = ['company', 'department', 'group']
                        let next = structTypeList.findIndex(e => e == name) + 1;
                        if (next > 0 && structTypeList[next]) {
                            self.setStruct(structTypeList[next] as any, dom.val());
                        }
                    });
                }
            },
            beforeQuery: function (data) {
                let deleteIfNullList = [
                    'id', 'account', 'nickname', 'role', 'authority',
                    'createDateStart', 'createDateEnd', 'editDateStart', 'editDateEnd'
                ];
                deleteIfNullList.forEach(key => {
                    if (!data[key])
                        delete data[key];
                });
            },

            editAfterRender: function (item, self) {
            },
            beforeSave: function () {
                var list = [{
                    name: 'nickname',
                    desc: '昵称',
                    dom: $('#nickname'),
                    canNotNull: true,
                }, {
                    name: 'password',
                    desc: '密码',
                    dom: $('#password'),
                }, {
                    name: 'newPassword',
                    desc: '新密码',
                    dom: $('#newPassword'),
                    checkValue: function (val, model, checkOpt) {
                        if (val && !model['password']) {
                            checkOpt.dom = $('#password');
                            return '请输入密码';
                        }
                    }
                }, {
                    name: 'newPasswordRepeat',
                    desc: '新密码',
                    dom: $('#newPasswordRepeat'),
                    checkValue: function (val, model) {
                        if (model['newPassword'] && val != model['newPassword'])
                            return '密码不一致';
                    }
                }];
                var checkRes = common.dataCheck({list: list});
                if (checkRes.success) {
                    var data = checkRes.model;
                    if (data.newPassword) {
                        data.newPassword = common.md5(data.newPassword);
                        data.password = common.md5(data.password);
                    }
                    delete data.newPasswordRepeat;
                }
                return checkRes;
            },
            onSaveSuccess: function (t, self) {
                common.msgNotice({
                    type: 1, msg: '修改成功', btnOptList: [{
                        content: '确认',
                        cb: function () {
                            location.reload(true);
                        }
                    }]
                });
            },
            onDetailQuerySuccess: function (t, self: ModuleUserInfo) {
                self.detailRender(t.userInfo);
                self.currUserId = t.userInfo.id;
                self.currUserDetail = t;
                self.updateView(['userInfoDetail'], {userInfoAllDetail: t});
                self.detailDom.modal('show');
                common.promise(() => {
                    if (!self.structTree) {
                        return self.structQuery();
                    }
                }).then(() => {
                    self.setStruct();
                });
            },
        };
        opt = $.extend(opt, option);
        super(opt);
    }

    updateView(list, opt) {
        let self = this;
        if (!list || common.isInArray('userInfoDetail', list)) {
            self.setAuthorityAutoComplete();
            self.setRoleAutoComplete();
            if (opt.userInfoAllDetail) {
                opt.userInfoDetail = opt.userInfoAllDetail.userInfo;
                opt.userInfoDetail.operation = opt.userInfoAllDetail.operation;
                $(opt.userInfoAllDetail.authorityList).each(function (i, item) {
                    self.authorityAutoComplete.setAuthority(item);
                });
                $(opt.userInfoAllDetail.roleList).each(function (i, item) {
                    self.roleAutoComplete.setRole(item);
                });
            }
            if (opt.userInfoDetail) {
                self.detailDom.find('.footer').hide();
                if (common.isInArray('save', opt.userInfoDetail.operation)) {
                    self.detailDom.find('.footer').show();
                }
            }
        }
    }

    adminSave() {
        let self = this;
        var data = {
            id: self.detailContainerDom.find('[name=id]').val(),
            addAuthorityList: [],
            delAuthorityList: [],
            addRoleList: [],
            delRoleList: [],
            structList: []
        };
        self.detailContainerDom.find('[name=userAuthority]').each(function () {
            var dom = $(this);
            var code = dom.data('code');
            var changeStatus = dom.data('changeStatus');
            if (changeStatus == 1)
                data.addAuthorityList.push(code);
            else if (changeStatus == -2)
                data.delAuthorityList.push(code);
        });

        self.detailContainerDom.find('[name=userRole]').each(function () {
            var dom = $(this);
            var code = dom.data('code');
            var changeStatus = dom.data('changeStatus');
            if (changeStatus == 1)
                data.addRoleList.push(code);
            else if (changeStatus == -2)
                data.delRoleList.push(code);
        });

        self.detailContainerDom.find('[name=structBox] select').each(function () {
            var dom = $(this);
            var val = dom.find('option:selected').val() || '';
            let oldStruct = dom.data('oldStruct') || '';
            if (oldStruct != val) {
                data.structList.push({type: dom.attr('name'), struct: val});
            }
        });

        common.promise(function () {
            if (!data.id || data.id == 0)
                throw new Error('id为空！');
            return myInterface.api.userInfoAdminSave(data);
        }).then(function (t) {
            common.msgNotice({
                type: 1, msg: '保存成功:' + t,
                btnOptList: [{
                    content: '确定', cb: function () {
                        self.detailDom.modal('hide');
                        self.pager.refresh();
                    }
                }]
            });
        }).fail(function (e) {
            common.msgNotice({type: 1, msg: e.message});
        });
    }

    //权限
    setAuthorityAutoComplete() {
        let self = this;
        self.authorityAutoComplete = new AuthorityAutoComplete({
            dom: self.detailContainerDom.find('[name=authority]'),
            renderDom: self.detailContainerDom.find('[name=authorityBox]'),
            labelName: 'userAuthority'
        });

        self.authorityAutoComplete.excludeByUserId = self.currUserId;
    }

    //角色
    setRoleAutoComplete() {
        let self = this;
        self.roleAutoComplete = new RoleAutoComplete({
            dom: self.detailContainerDom.find('[name=role]'),
            renderDom: self.detailContainerDom.find('[name=roleBox]'),
            labelName: 'userRole'
        });

        self.roleAutoComplete.excludeByUserId = self.currUserId;
    }

    structQuery() {
        var self = this;
        return myInterface.api.structQuery({status: 1}).then(t => {
            self.structTree = common.getTree(t.list, null, null, 'struct', 'parentStruct').rootTree;
        }).catch(e => {
            self.detailContainerDom.find('[name=structBox] [name=msg]').text(e.message);
        });
    }

    setStruct(type?: 'company' | 'department' | 'group', parentKey?) {
        let self = this;
        let structTree = self.structTree;
        if (parentKey) {
            structTree = common.findInTree(structTree, parentKey);
            structTree && (structTree = structTree.child);
        }
        if (!type)
            type = 'company';
        if (structTree) {
            let html = [];
            let oldVal = '';
            for (let key in structTree) {
                let struct = structTree[key].item;
                if (struct.type == type) {
                    let selected = self.currUserDetail && self.currUserDetail.structList.find(ele => ele.struct == struct.struct);
                    if (selected)
                        oldVal = struct.struct;
                    html.push(`<option value="${struct.struct}" ${selected ?
                        'selected' : ''}>${struct.structName}(${struct.struct})</option>`);
                }
            }
            if (html.length)
                html.unshift('<option></option>');
            let select = self.detailContainerDom.find(`[name=${type}]`);
            select.html(html.join(''));
            if (oldVal)
                select.data('oldStruct', oldVal);
            select.trigger('change');
        }
    }
}