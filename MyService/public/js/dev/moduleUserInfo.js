/**
 * Created by bang on 2017-9-11.
 */
namespace('moduleUserInfo');
moduleUserInfo = {
    init: function (option) {
        var self = this;
        var opt = {
            operation: ['query', 'save', 'detailQuery'],
            queryId: 'search',
            queryItemTempId: 'itemTemp',
            queryContainerId: 'list',

            rowClass: 'itemRow',
            interfacePrefix: 'userInfo',

            queryArgsOpt: [{
                name: 'id',
                dom: $('#id'),
                checkValue: function (val) {
                    if (val && !my.vaild.isInt(val, '001'))
                        return '请输入正确的正整数';
                }
            }, {
                name: 'account',
                dom: $('#account'),
            }, {
                name: 'nickname',
                dom: $('#nickname'),
            }, {
                name: 'create_datetime_start',
                dom: $('#create_datetime_start'),
            }, {
                name: 'create_datetime_end',
                dom: $('#create_datetime_end'),
            }, {
                name: 'edit_datetime_start',
                dom: $('#edit_datetime_start'),
            }, {
                name: 'edit_datetime_end',
                dom: $('#edit_datetime_end'),
            }
            ],
            bindEvent: function (self) {
                $('#create_datetime_start').on('click', function () {
                    var datePickerArgs = {
                        el: this,
                        //startDate: '#{%y-30}-01-01',
                        doubleCalendar: true,
                        dateFmt: 'yyyy-MM-dd',
                        minDate: '1900-01-01',
                        maxDate: '#F{$dp.$D(\'create_datetime_end\')}',
                    };
                    WdatePicker(datePickerArgs);
                });
                $('#create_datetime_end').on('click', function () {
                    var datePickerArgs = {
                        el: this,
                        //startDate: minDate || '#{%y-30}-01-01',
                        doubleCalendar: true,
                        dateFmt: 'yyyy-MM-dd',
                        minDate: '#F{$dp.$D(\'create_datetime_start\')||\'1900-01-01\'}',
                        maxDate: '',
                    };
                    WdatePicker(datePickerArgs);
                });

                $('#edit_datetime_start').on('click', function () {
                    var datePickerArgs = {
                        el: this,
                        //startDate: '#{%y-30}-01-01',
                        doubleCalendar: true,
                        dateFmt: 'yyyy-MM-dd',
                        minDate: '1900-01-01',
                        maxDate: '#F{$dp.$D(\'edit_datetime_end\')}',
                    };
                    WdatePicker(datePickerArgs);
                });
                $('#edit_datetime_end').on('click', function () {
                    var datePickerArgs = {
                        el: this,
                        //startDate: minDate || '#{%y-30}-01-01',
                        doubleCalendar: true,
                        dateFmt: 'yyyy-MM-dd',
                        minDate: '#F{$dp.$D(\'edit_datetime_start\')||\'1900-01-01\'}',
                        maxDate: '',
                    };
                    WdatePicker(datePickerArgs);
                });

                $(document).on('click', '.admin-save', function () {
                    self.opt.adminSave(self);
                });
            },
            beforeQuery: function (data) {
                if (!data.id) data.id = null;
                if (!data.account) data.account = null;
                if (!data.nickname) data.nickname = null;
                if (!data.auth) data.auth = null;
                if (!data.create_datetime_start) data.create_datetime_start = null;
                if (!data.create_datetime_end) data.create_datetime_end = null;
                if (!data.edit_datetime_start) data.edit_datetime_start = null;
                if (!data.edit_datetime_end) data.edit_datetime_end = null;
            },

            editAfterRender: function (item, self) {
                // self.opt.updateView(['userInfoDetail'], {userInfoDetail: item});
                // $('#userInfoSave').modal('show');
            },
            beforeSave: function () {
            },
            onSaveSuccess: function (t, self) {
            },
            onDetailQuerySuccess: function (t, self) {
                self.detailRender(t.user_info);
                self.opt.updateView(['userInfoDetail'], {userInfoAllDetail: t}, self);
                $('#userInfoSave').modal('show');
            },

            updateView: function (list, opt, self) {
                if (!list || common.isInArray('userInfoDetail', list)) {
                    self.opt.setAuthorityAutoComplete(self);
                    self.opt.setRoleAutoComplete(self);
                    if (opt.userInfoAllDetail) {
                        opt.userInfoDetail = opt.userInfoAllDetail.user_info;
                        opt.userInfoDetail.operation = opt.userInfoAllDetail.operation;
                        $(opt.userInfoAllDetail.authority_list).each(function (i, item) {
                            self.opt.setAuthority(item, self);
                        });
                        $(opt.userInfoAllDetail.role_list).each(function (i, item) {
                            self.opt.setRole(item, self);
                        });
                    }
                    if (opt.userInfoDetail) {
                        $('#userInfoSave [name=footer]').hide();
                        if (common.isInArray('save', opt.userInfoDetail.operation)) {
                            $('#userInfoSave [name=footer]').show();
                        }
                    }
                }
            },
            adminSave: function (self) {
                var data = {
                    id: $('#userInfoSave [name=id]').val(),
                    authorityList: [],
                    roleList: []
                };
                $('#userInfoSave [name=userAuthority]').each(function () {
                    data.authorityList.push($(this).data('code'));
                });

                $('#userInfoSave [name=userRole]').each(function () {
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
                                $('#userInfoSave').modal('hide');
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
                    source: self.opt.getAuthority,
                    dom: $('#userInfoSave [name=authority]'),
                    select: function (dom, item) {
                        //dom.data('item', item).val(item.code);
                        var match = $('#userInfoSave [name=authorityBox]').find(`[name=userAuthority][data-code=${item.code}]`);
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
            getAuthority: function (self) {
                return my.interface.authorityQuery({status: 1, page_size: 10}).then(function (t) {
                    return t.list;
                });
            },
            setAuthority: function (item, self) {
                item.labelName = 'userAuthority';
                var temp = $('#authorityLabelTemp').html();
                var dom = $(ejs.render(temp, item));
                dom.data('item', item);
                $('#userInfoSave [name=authorityBox]').append(dom);
            },

            //角色
            setRoleAutoComplete: function (self) {
                common.autoComplete({
                    source: self.opt.getRole,
                    dom: $('#userInfoSave [name=role]'),
                    select: function (dom, item) {
                        //dom.data('item', item).val(item.code);
                        var match = $('#userInfoSave [name=roleBox]').find(`[name=userRole][data-code=${item.code}]`);
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
            getRole: function (self) {
                return my.interface.roleQuery({status: 1, page_size: 10}).then(function (t) {
                    return t.list;
                });
            },
            setRole: function (item, self) {
                item.labelName = 'userRole';
                var temp = $('#roleLabelTemp').html();
                var dom = $(ejs.render(temp, item));
                dom.data('item', item);
                $('#userInfoSave [name=roleBox]').append(dom);
            },
        };
        opt = $.extend(opt, option);
        return new module(opt);
    },
};