/**
 * Created by bang on 2017-9-11.
 */
namespace('modelMainContentType');
var modelMainContentType = {
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
    },
    query: function () {
        var self = this;
        var data = {};
        $('#list').removeClass('error');
        data.page_index = self.pager.pageIndex;
        data.page_size = self.pager.pageSize;

        return my.interface.mainContentTypeQuery(data).then(function (t) {
            $('#list .item').remove();
            var temp = $('#mainContentTypeItem').html();
            $(t.list).each(function (i) {
                var item = this;
                item.colNum = i + 1;
                $('#list').append(ejs.render(temp, item));
            });
            return t;
        }).fail(function (e) {
            $('#logList .item').remove();
            if (e instanceof Error) e = e.message;
            if (typeof e == 'object') e = JSON.stringify(e);
            $('#msg').html(e);
            $('#list').addClass('error');
        });
    },
}