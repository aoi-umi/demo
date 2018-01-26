/**
 * Created by bang on 2017-9-11.
 */
namespace('moduleRole');
moduleRole = {
    init: function (option) {
        var self = this;
        var opt = {
            operation: ['query', 'save', 'detailQuery'],
            queryId: 'query',
            queryItemTempId: 'itemTemp',
            queryContainerId: 'list',

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
                    if (val && !my.vaild.isInt(val, '001'))
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
            },],
            init: function (self) {
            },
            bindEvent: function (self) {
            },
            beforeQuery: function (data) {
                if (!data.id) data.id = null;
                if (!data.code) data.code = null;
                if (!data.name) data.name = null;
                if (!data.status) data.status = null;
            },

            editAfterRender: function (item, self) {
                self.opt.updateView(['roleDetail'], {roleDetail: item}, self);
                self.detailDom.modal('show');
            },
            beforeSave: function (dom, self) {
                if (dom.hasClass('itemStatusUpdate')) {
                    var row = dom.closest(self.rowClass);
                    var item = row.data('item');
                    var checkRes = {
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
                            if (!my.vaild.isRole(val))
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
                    var checkRes = common.dataCheck({list: list});
                    if (checkRes.success) {
                        var data = {
                            role: checkRes.model,
                            authorityList: []
                        };
                        self.detailContainerDom.find('[name=roleAuthority]').each(function () {
                            data.authorityList.push($(this).data('code'));
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
                self.detailRender(t.role);
                self.opt.updateView(['roleDetail'], {roleAllDetail: t}, self);
                self.detailDom.modal('show');
            },

            updateView: function (list, opt, self) {
                if (!list || common.isInArray('roleDetail', list)) {
                    self.opt.setAuthorityAutoComplete(self);

                    if (opt.roleAllDetail) {
                        opt.roleDetail = opt.roleAllDetail.role;
                        opt.roleDetail.operation = opt.roleAllDetail.operation;
                        $(opt.roleAllDetail.authorityList).each(function (i, item) {
                            self.opt.setAuthority(item, self);
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
                common.autoComplete({
                    source: function () {
                        return self.opt.getAuthority({code: this.dom.val()}, self)
                    },
                    dom: self.detailContainerDom.find('[name=authority]'),
                    select: function (dom, item) {
                        //dom.data('item', item).val(item.code);
                        var match = self.detailContainerDom.find('[name=authorityBox]').find(`[name=roleAuthority][data-code=${item.code}]`);
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
                item.labelName = 'roleAuthority';
                var temp = $('#authorityLabelTemp').html();
                var dom = $(ejs.render(temp, item));
                dom.data('item', item);
                self.detailContainerDom.find('[name=authorityBox]').append(dom);
            },
        };
        opt = $.extend(opt, option);
        return new module(opt);
    },
}