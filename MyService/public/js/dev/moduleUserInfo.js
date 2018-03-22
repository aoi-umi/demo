/**
 * Created by bang on 2017-9-11.
 */
(function (factory) {
    namespace('moduleUserInfo', factory(require, {}));
})(function (require, exports) {
    exports.init = function (option) {
        var self = this;
        var opt = {
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
                    if (val && !my.vaild.isInt(val, '001'))
                        return '请输入正确的正整数';
                }
            },],
            init: function (self) {
                if (self.operation.query) {
                    self.detailDom.find('.save').removeClass('save').addClass('admin-save');
                }
            },
            bindEvent: function (self) {
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
                        self.opt.adminSave(self);
                    });
                    self.queryContainerDom.on('click', '.toggle-auth', function () {
                        var authBox = $(this).siblings('.auth-box');
                        if (authBox.hasClass('hidden'))
                            authBox.removeClass('hidden');
                        else
                            authBox.addClass('hidden');
                    });

                    //角色
                    common.autoComplete({
                        source: function () {
                            return self.opt.getRole({code: this.dom.val()}, self)
                        },
                        dom: $('#role'),
                        select: function (dom, item) {
                            dom.data('item', item).val(item.code);
                        },
                        renderItem: function (ul, item) {
                            return $('<li>')
                                .append('<div>' + item.code + '</div>')
                                .appendTo(ul);
                        },
                        match: function (input, item) {
                            var matcher = new RegExp($.ui.autocomplete.escapeRegex(input), 'i');
                            return matcher.test(item.code);
                        }
                    });
                    //权限
                    common.autoComplete({
                        source: function () {
                            return self.opt.getAuthority({code: this.dom.val()}, self)
                        },
                        dom: $('#authority'),
                        select: function (dom, item) {
                            dom.data('item', item).val(item.code);
                        },
                        renderItem: function (ul, item) {
                            return $('<li>')
                                .append('<div>' + item.code + '</div>')
                                .appendTo(ul);
                        },
                        match: function (input, item) {
                            var matcher = new RegExp($.ui.autocomplete.escapeRegex(input), 'i');
                            return matcher.test(item.code);
                        }
                    });
                }
            },
            beforeQuery: function (data) {
                if (!data.id) data.id = null;
                if (!data.account) data.account = null;
                if (!data.nickname) data.nickname = null;
                if (!data.role) data.role = null;
                if (!data.authority) data.authority = null;
                if (!data.createDateStart) data.createDateStart = null;
                if (!data.createDateEnd) data.createDateEnd = null;
                if (!data.editDateStart) data.editDateStart = null;
                if (!data.editDateEnd) data.editDateEnd = null;
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
            onDetailQuerySuccess: function (t, self) {
                self.detailRender(t.userInfo);
                self.opt.updateView(['userInfoDetail'], {userInfoAllDetail: t}, self);
                self.detailDom.modal('show');
            },

            updateView: function (list, opt, self) {
                if (!list || common.isInArray('userInfoDetail', list)) {
                    self.opt.setAuthorityAutoComplete(self);
                    self.opt.setRoleAutoComplete(self);
                    if (opt.userInfoAllDetail) {
                        opt.userInfoDetail = opt.userInfoAllDetail.userInfo;
                        opt.userInfoDetail.operation = opt.userInfoAllDetail.operation;
                        $(opt.userInfoAllDetail.authorityList).each(function (i, item) {
                            self.opt.setAuthority(item, self);
                        });
                        $(opt.userInfoAllDetail.roleList).each(function (i, item) {
                            self.opt.setRole(item, self);
                        });
                    }
                    if (opt.userInfoDetail) {
                        self.detailDom.find('.footer').hide();
                        if (common.isInArray('save', opt.userInfoDetail.operation)) {
                            self.detailDom.find('.footer').show();
                        }
                    }
                }
            },
            adminSave: function (self) {
                var data = {
                    id: self.detailContainerDom.find('[name=id]').val(),
                    authorityList: [],
                    roleList: []
                };
                self.detailContainerDom.find('[name=userAuthority]').each(function () {
                    data.authorityList.push($(this).data('code'));
                });

                self.detailContainerDom.find('[name=userRole]').each(function () {
                    data.roleList.push($(this).data('code'));
                });
                common.promise().then(function () {
                    if (!data.id || data.id == 0)
                        return $.Deferred().reject(new Error('id为空！'));
                    return my.interface.userInfoAdminSave(data);
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
            },
            //权限
            setAuthorityAutoComplete: function (self) {
                common.autoComplete({
                    source: function () {
                        return self.opt.getAuthority({code: this.dom.val()}, self)
                    },
                    dom: self.detailContainerDom.find('[name=authority]'),
                    select: function (dom, item) {
                        //dom.data('item', item).val(item.code);
                        var match = self.detailContainerDom.find('[name=authorityBox]').find(`[name=userAuthority][data-code=${item.code}]`);
                        if (!match.length) {
                            self.opt.setAuthority(item, self);
                        }
                    },
                    renderItem: function (ul, item) {
                        return $('<li>')
                            .append('<div>' + item.code + '</div>')
                            .appendTo(ul);
                    },
                    match: function (input, item) {
                        var matcher = new RegExp($.ui.autocomplete.escapeRegex(input), 'i');
                        return matcher.test(item.code);
                    }
                });
            },
            getAuthority: function (opt, self) {
                var queryOpt = {status: 1};
                if (opt) queryOpt.code = opt.code;
                return my.interface.authorityQuery(queryOpt).then(function (t) {
                    return t.list;
                });
            },
            setAuthority: function (item, self) {
                item.labelName = 'userAuthority';
                var temp = $('#authorityLabelTemp').html();
                var dom = $(ejs.render(temp, item));
                dom.data('item', item);
                self.detailContainerDom.find('[name=authorityBox]').append(dom);
            },

            //角色
            setRoleAutoComplete: function (self) {
                common.autoComplete({
                    source: function () {
                        return self.opt.getRole({code: this.dom.val()}, self)
                    },
                    dom: self.detailContainerDom.find('[name=role]'),
                    select: function (dom, item) {
                        //dom.data('item', item).val(item.code);
                        var match = self.detailContainerDom.find('[name=roleBox]').find(`[name=userRole][data-code=${item.code}]`);
                        if (!match.length) {
                            self.opt.setRole(item, self);
                        }
                    },
                    renderItem: function (ul, item) {
                        return $('<li>')
                            .append('<div>' + item.code + '</div>')
                            .appendTo(ul);
                    },
                    match: function (input, item) {
                        var matcher = new RegExp($.ui.autocomplete.escapeRegex(input), 'i');
                        return matcher.test(item.code);
                    }
                });
            },
            getRole: function (opt, self) {
                var queryOpt = {status: 1};
                if (opt) queryOpt.code = opt.code;
                return my.interface.roleQuery(queryOpt).then(function (t) {
                    return t.list;
                });
            },
            setRole: function (item, self) {
                item.labelName = 'userRole';
                var temp = $('#roleLabelTemp').html();
                var dom = $(ejs.render(temp, item));
                dom.data('item', item);
                self.detailContainerDom.find('[name=roleBox]').append(dom);
            },
        };
        opt = $.extend(opt, option);
        return new module(opt);
    };
    return exports;
});