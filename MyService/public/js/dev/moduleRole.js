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
                $('#authoritySave').on('keyup', '[name=authority]', function () {
                    self.opt.getAuthority(self).then(function (t) {

                    });
                });
            },
            beforeQuery: function (data) {
                if (!data.id) data.id = null;
                if (!data.code) data.code = null;
                if (!data.name) data.name = null;
                if (!data.status) data.status = null;
            },

            editAfterRender: function (item, self) {
                $('#roleSave [name=title]').html(item.id ? ('修改:' + item.id) : '新增');
                self.opt.updateView(['roleDetail'], {roleDetail: item});
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
                self.detailRender(t);
                self.opt.updateView(['roleDetail'], {roleDetail: t});
                $('#roleSave').modal('show');
            },

            updateView: function (list, opt, self) {
                if (!list || common.isInArray('roleDetail', list)) {
                    if (opt.roleDetail) {
                        if (common.isInArray('save', opt.roleDetail.operation)) {
                            $('#authoritySave [name=footer]').show();
                        } else {
                            $('#authoritySave [name=footer]').hide();
                        }
                    }
                }

                if (!list || common.isInArray('authorityList', list)) {
                    if (opt.authorityList && opt.authorityList.length) {
                        var htmlList = [];
                        $(opt.authorityList).each(function () {

                        });
                    }
                }
            },
            getAuthority: function (self) {
                return my.interface.authorityQuery({status: 1}).then(function (t) {
                    return t.list;
                });
            },
        };
        opt = $.extend(opt, option);
        return new module(opt);
    },
}