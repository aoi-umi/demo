/**
 * Created by bang on 2017-9-11.
 */
namespace('moduleMainContent');
moduleMainContent = {
    init: function (option) {
        var self = this;
        var opt = {
            mainContentDetailUrl:'/mainContentDetail',
            //module参数
            operation: [],
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
            init: function(self){
                if(self.operation.detailQuery) {
                    console.log(extend.getArgsFromUrlParams());
                }
            },
            bindEvent: function (self) {
                if(self.operation.query) {
                    var toDetail = [self.addId, self.detailQueryClass].join(',');
                    $(document).on('click', toDetail, function () {
                        var dom = $(this);
                        var item = {id: 0};
                        if (dom.attr('id') == self.opt.addId) {
                        } else {
                            item.id = dom.closest(self.rowClass).data('item').id;
                        }
                        var url = self.opt.mainContentDetailUrl + '?id=' + item.id;
                        var args = {
                            id: 0,
                            noNav: true
                        };
                        var url = self.opt.mainContentDetailUrl + '?';

                        if (parent.my.tab) {
                            var params = extend.getUrlParamsFromArgs(args);
                            var data = {
                                id: 'mainContentDetail',
                                name: item.id == 0 ? '新增内容' : '内容:' + item.id,
                                content: url + params
                            };
                            parent.my.tab.addOrOpenTab(data);
                        }
                        else {
                            args.noNav = false;
                            var params = extend.getUrlParamsFromArgs(args);
                            window.open(url + params);
                        }
                    });
                }
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