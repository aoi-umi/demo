/**
 * Created by bang on 2017-9-11.
 */
namespace('moduleAuthority');
moduleAuthority = {
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
            interfacePrefix: 'authority',
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
            bindEvent: function (self) {

            },
            beforeQuery: function (data) {
                if (!data.id) data.id = null;
                if (!data.code) data.code = null;
                if (!data.name) data.name = null;
                if (!data.status) data.status = null;
            },

            editAfterRender: function (item, self) {
                self.opt.updateView(['authorityDetail'], {authorityDetail: item});
                $('#authoritySave').modal('show');
            },
            beforeSave: function () {
                var list = [{
                    name: 'id',
                    dom: $('#authoritySave [name=id]'),
                }, {
                    name: 'code',
                    desc: '权限编号',
                    dom: $('#authoritySave [name=code]'),
                    canNotNull: true,
                    checkValue: function (val) {
                        if (!my.vaild.isAuthority(val))
                            return '{0}只能由字母、数字、下划线组成';
                    }
                }, {
                    name: 'name',
                    dom: $('#authoritySave [name=name]'),
                }, {
                    name: 'status',
                    dom: $('#authoritySave [name=status]'),
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
                            $('#authoritySave').modal('hide');
                            self.pager.refresh();
                        }
                    }]
                });
            },
            onDetailQuerySuccess: function (t, self) {
                self.detailRender(t);
                self.opt.updateView(['authorityDetail'], {authorityDetail: t});
                $('#authoritySave').modal('show');
            },

            updateView: function (list, opt, self) {
                if (!list || common.isInArray('authorityDetail', list)) {
                    if (opt.authorityDetail) {
                        var authority = opt.authorityDetail;
                        $('#authoritySave [name=title]').html(authority.id ? ('修改:' + authority.id) : '新增');
                        if (common.isInArray('save', opt.authorityDetail.operation)) {
                            $('#authoritySave [name=footer]').show();
                        } else {
                            $('#authoritySave [name=footer]').hide();
                        }
                    }
                }
            }
        };
        opt = $.extend(opt, option);
        return new module(opt);
    },
};