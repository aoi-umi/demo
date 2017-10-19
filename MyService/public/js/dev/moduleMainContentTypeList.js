/**
 * Created by bang on 2017-9-11.
 */
namespace('moduleMainContentTypeList');
moduleMainContentTypeList = {
    pager: null,
    init: function () {
        var self = this;
        self.bindEvent();
        self.pager = new my.pager({
            changeHandle: function (cb) {
                self.query().then(function (t) {
                    cb({count: t.count});
                }).fail(function () {
                    cb();
                });
            }
        });

        $('#search').click();
    },
    bindEvent: function () {
        var self = this;
        $('#search').on('click', function () {
            self.pager.gotoPage(1);
        });

        $('#add').on('click', function(){
            self.edit();
        });

        $('#list').on('click','[name=edit]', function(){
            var row = $(this).closest('.itemRow');
            self.edit(row.data('item'));
        });

        $('#mainContentTypeSave [name=accept]').on('click', function(){
            self.save();
        });
    },
    query: function () {
        var self = this;
        var data = {};
        $('#list').removeClass('error');
        data.page_index = self.pager.pageIndex;
        data.page_size = self.pager.pageSize;

        return my.interface.mainContentTypeQuery(data).then(function (t) {
            $('#list .itemRow').remove();
            var temp = $('#mainContentTypeItem').html();
            $(t.list).each(function (i) {
                var item = this;
                item.colNum = i + 1;
                $('#list').append($(ejs.render(temp, item)).data('item', item));
            });
            return t;
        }).fail(function (e) {
            $('#list .itemRow').remove();
            if (e instanceof Error) e = e.message;
            if (typeof e == 'object') e = JSON.stringify(e);
            $('#msg').html(e);
            $('#list').addClass('error');
        });
    },
    edit: function(item) {
        if (!item) {
            item = {
                id: 0,
                type: '',
                type_name: '',
                parent_type: '',
                level: 0
            };
        }
        $('#mainContentTypeSave [name=title]').html(item.id ? ('修改:' + item.id) : '新增');
        var temp = $('#mainContentTypeSaveTemplate').html();
        $('#mainContentTypeSave [name=content]').html(ejs.render(temp, item));
        $('#mainContentTypeSave').modal('show');
    },
    save: function() {
        var self = this;
        var list = [{
            name: 'id',
            dom: $('#mainContentTypeSave [name=id]'),
        }, {
            name: 'type',
            dom: $('#mainContentTypeSave [name=type]'),
            canNotNull: true,
        }, {
            name: 'type_name',
            dom: $('#mainContentTypeSave [name=type_name]'),
        }, {
            name: 'parent_type',
            dom: $('#mainContentTypeSave [name=parent_type]'),
        }, {
            name: 'level',
            dom: $('#mainContentTypeSave [name=level]'),
        }];
        var checkRes = extend.dataCheck({list: list});
        console.log(checkRes)
        if (!checkRes.success) {
            if (checkRes.dom) {
                extend.msgNotice({target: checkRes.dom.selector, msg: checkRes.desc});
                checkRes.dom.focus();
            } else {
                alert(checkRes.desc);
            }
            return $.Deferred().reject();
        }
        var data = checkRes.model;
        return my.interface.mainContentTypeSave(data).then(function (t) {
            extend.msgNotice({
                type: 1, msg: '保存成功:' + t,
                btnOptList: [{
                    content: '继续'
                }, {
                    content: '关闭', cb: function () {
                        $('#mainContentTypeSave').modal('hide');
                    }
                }]
            });
            self.pager.gotoPage(1);
        }).fail(function (e) {
            console.log(e)
            extend.msgNotice({type: 1, msg: e.message});
        });
    }
};