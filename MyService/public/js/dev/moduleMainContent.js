/**
 * Created by bang on 2017-9-11.
 */
namespace('moduleMainContent');
moduleMainContent = {
    init: function (option) {
        var self = this;
        var opt = {
            operation: ['query', 'save', 'del', 'detailQuery'],
            queryId: 'search',
            queryItemTempId: 'mainContentItem',
            queryContainerId: 'list',

            detailContainerId: 'detailContainer',
            detailTempId: 'mainContentSaveTemp',

            saveId: 'save',
            saveDefaultModel: {
                id: 0,
                type: '',
                status: '',
                user_info_id: '',
                title: '',
                desc: '',
                create_date: '',
                operate_date: '',
                operator: '',
            },
            addId: 'add',

//            rowClass: 'itemRow',
//            editClass: 'itemEdit',
            interfacePrefix: 'mainContent',
            queryArgsOpt: [{
                name: 'id',
                dom: $('#id'),
                checkValue: function (val) {
                    if (val && !my.vaild.isInt(val, '001'))
                        return '请输入正确的正整数';
                }
            }, {
                name: 'type',
                dom: $('#type'),
            }, {
                name: 'status',
                dom: $('#status'),
            }, {
                name: 'user_info_id',
                dom: $('#user_info_id'),
            }, {
                name: 'title',
                dom: $('#title'),
            }, {
                name: 'create_date',
                dom: $('#create_date'),
            }, {
                name: 'operate_date',
                dom: $('#operate_date'),
            }, {
                name: 'operator',
                dom: $('#operator'),
            }],
            bindEvent: function () {
            },
            beforeQuery: function (data) {
                if (!data.id) data.id = null;
                if (!data.type) data.type = null;
                if (!data.status) data.status = null;
                if (!data.user_info_id) data.user_info_id = null;
                if (!data.create_date) data.create_date = null;
                if (!data.operate_date) data.operate_date = null;
            },
            afterEdit: function (item) {

            },
            beforeSave: function () {

            },
            onSaveSuccess: function (t, self) {

            },
            onDetailQuerySuccess: function (t, self) {

            }
        };
        opt = $.extend(opt, option);
        return new module(opt);
    }
};