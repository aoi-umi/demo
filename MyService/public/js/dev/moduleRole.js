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

            detailContainerId: 'detailContainer',
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
                $('#roleSave').modal('show');
            },
            beforeSave: function () {
                var list = [{
                    name: 'id',
                    dom: $('#roleSave [name=id]'),
                }, {
                    name: 'code',
                    dom: $('#roleSave [name=code]'),
                    canNotNull: true,
                }, {
                    name: 'name',
                    dom: $('#roleSave [name=name]'),
                }, {
                    name: 'status',
                    dom: $('#roleSave [name=status]'),
                    getValue: function () {
                        return this.dom.prop('checked');
                    }
                },];
                var checkRes = common.dataCheck({list: list});
                if (checkRes.success) {
                    var data = {
                        role: checkRes.model,
                        authorityIdList: []
                    };
                    $('#roleSave [name=roleAuthority]').each(function () {
                        data.authorityIdList.push($(this).data('id'));
                    });
                    checkRes.model = data;
                }
                return checkRes;
            },
            onSaveSuccess: function (t, self) {
                common.msgNotice({
                    type: 1, msg: '保存成功:' + t,
                    btnOptList: [{
                        content: '继续'
                    }, {
                        content: '关闭', cb: function () {
                            $('#roleSave').modal('hide');
                            self.pager.refresh();
                        }
                    }]
                });
            },
            onDetailQuerySuccess: function (t, self) {
                self.detailRender(t.role);
                self.opt.updateView(['roleDetail'], {roleAllDetail: t}, self);
                $('#roleSave').modal('show');
            },

            updateView: function (list, opt, self) {
                if (!list || common.isInArray('roleDetail', list)) {
                    self.opt.setAuthorityAutoComplete(self);

                    if (opt.roleAllDetail) {
                        opt.roleDetail = opt.roleAllDetail.role;
                        opt.roleDetail.operation = opt.roleAllDetail.operation;
                        $(opt.roleAllDetail.authority_list).each(function (i, item) {
                            self.opt.setAuthority(item, self);
                        });
                    }
                    if (opt.roleDetail) {
                        $('#roleSave [name=footer]').hide();
                        var role = opt.roleDetail;
                        $('#roleSave [name=title]').html(role.id ? ('修改:' + role.id) : '新增');
                        if (common.isInArray('save', opt.roleDetail.operation)) {
                            $('#roleSave [name=footer]').show();
                        }
                    }
                }
            },
            setAuthorityAutoComplete: function (self) {
                common.autoComplete({
                    source: self.opt.getAuthority,
                    dom: $('#roleSave [name=authority]'),
                    select: function (dom, item) {
                        //dom.data('item', item).val(item.code);
                        var match = $('#roleSave [name=authorityBox]').find(`[name=roleAuthority][data-id=${item.id}]`);
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
                return my.interface.authorityQuery({status: 1}).then(function (t) {
                    return t.list;
                });
            },
            setAuthority: function (item, self) {
                item.labelName = 'roleAuthority';
                var temp = $('#authorityLabelTemp').html();
                var dom = $(ejs.render(temp, item));
                dom.data('item', item);
                $('#roleSave [name=authorityBox]').append(dom);
            },
        };
        opt = $.extend(opt, option);
        return new module(opt);
    },
}