/**
 * Created by bang on 2017-9-11.
 */
namespace('modelMainContentTypeList');
var modelMainContentTypeList = {
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
                level: 10
            };
        }
        $('#mainContentTypeSave [name=title]').html(item.id ? ('修改:' + item.id) : '新增');
        var temp = $('#mainContentTypeSaveTemplate').html();
        $('#mainContentTypeSave [name=content]').html(ejs.render(temp, item));
        $('#mainContentTypeSave').modal('show');
    },
    save: function(){
        var data = {id:0, type: 1};
        return my.interface.mainContentTypeSave(data);
        //$('#mainContentTypeSave').modal('hide');
    }
};