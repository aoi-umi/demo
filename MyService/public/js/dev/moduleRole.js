/**
 * Created by bang on 2017-9-11.
 */
namespace('moduleRole');
moduleRole = {
    init: function (option) {
        var self = this;
        var opt = {
            operation: ['query'],
            queryId: 'query',
            queryItemTempId: 'itemTemp',
            queryContainerId: 'list',

            rowClass: 'itemRow',
            interfacePrefix: 'role',

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
            },{
                name: 'name',
                dom: $('#name'),
            },{
                name: 'status',
                dom: $('#status'),
            }, ],
            bindEvent: function (self) {

            },
            beforeQuery: function (data) {
                if (!data.id) data.id = null;
                if (!data.code) data.code = null;
                if (!data.name) data.name = null;
                if (!data.status) data.status = null;
            }
        };
        opt = $.extend(opt, option);
        return new module(opt);
    },
}