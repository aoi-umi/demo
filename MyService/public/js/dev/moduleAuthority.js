/**
 * Created by bang on 2017-9-11.
 */
(function (factory) {
    namespace('moduleAuthority', factory(require, {}));
})(function (require, exports) {
    exports.init = function (option) {
        var opt = {
            operation: ['query', 'save', 'detailQuery'],
            queryId: 'query',
            queryItemTempId: 'itemTemp',
            queryContainerId: 'list',

            detailId: 'detail',
            detailContainerName: 'detailContainer',
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
                self.opt.updateView(['authorityDetail'], {authorityDetail: item}, self);
                self.detailDom.modal('show');
            },
            beforeSave: function (dom, self) {
                if (dom.hasClass('itemStatusUpdate')) {
                    var row = dom.closest(self.rowClass);
                    var item = row.data('item');
                    var checkRes = {
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
                            if (!my.vaild.isAuthority(val))
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
            onDetailQuerySuccess: function (t, self) {
                self.detailRender(t);
                self.opt.updateView(['authorityDetail'], {authorityDetail: t}, self);
                self.detailDom.modal('show');
            },

            updateView: function (list, opt, self) {
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
        };
        opt = $.extend(opt, option);
        return new module(opt);
    };
    return exports;
});