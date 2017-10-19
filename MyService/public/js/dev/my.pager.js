/**
 * Created by umi on 2017-9-10.
 */
namespace('my.pager');
my.pager = function (option) {
    this.init(option);
};
my.pager.prototype = {
    opt: {
        pagerId: 'pager',
        maxPageCount: 5,
        pageIndex: 1,
        pageSize: 10,
        template:
            `<form class="form-inline text-right">
                <ul class="pagination">
                    <li><a name="myPagerPrev" href="javascript:;">&laquo;</a></li>
                    <li><a name="myPagerNext" href="javascript:;">&raquo;</a></li>
                    <li><span style="margin-left:5px" name="count">0</span></li>
                    <li><span style="margin-right:5px" name="currPage">1/1</span></li>
                    <div class="input-group" style="width:100px">
                        <input name="myPagerGotoInput" class="form-control" type="text"/>
                        <span class="input-group-btn">
                            <button name="myPagerGotoBtn" class="btn btn-default" type="button">go</button>
                        </span>
                    </div>
                </ul>
            </form>`,
    },
    init: function (option) {
        var self = this;
        var opt = $.extend(self.opt, option);
        self.pageIndex = opt.pageIndex;
        self.pageSize = opt.pageSize;
        var pagerDom = $('#' + opt.pagerId);
        pagerDom.on('click', '[name=myPagerGotoBtn]', function () {
            var page = pagerDom.find('[name=myPagerGotoInput]').val();
            self.gotoPage(page);
        }).on('click', '[name=myPagerPage]', function () {
            var page = $(this).data('page');
            self.gotoPage(page);
        }).on('click', 'li:not(.disabled) [name=myPagerPrev]', function () {
            self.gotoPage(self.pageIndex - 1);
        }).on('click', 'li:not(.disabled) [name=myPagerNext]', function () {
            self.gotoPage(self.pageIndex + 1);
        });
    },
    gotoPage: function (page) {
        var self = this;
        var opt = self.opt;
        var pagerDom = $('#' + opt.pagerId);
        page = parseInt(page);
        if(isNaN(page) || page <= 0)
            throw  new Error('page must be a int and large than 0');
        pagerDom.empty();
        if(opt.changeHandle){
            self.pageIndex = page;
            opt.changeHandle(function (t) {
                if(t && t.count) {
                    var dom = $(opt.template);
                    var totalPage = Math.ceil(t.count / opt.pageSize);
                    var pageHtml = [];
                    var pageStart = 1;
                    var pageEnd = totalPage;
                    if(totalPage + 1 - page > opt.maxPageCount){
                        pageStart = page;
                        pageEnd = page + opt.maxPageCount - 1;
                    }
                    if(page > opt.maxPageCount && pageEnd - pageStart > opt.maxPageCount){
                        pageStart = pageEnd - opt.maxPageCount + 1;
                    }
                    for(var i = pageStart;i <= pageEnd;i++){
                        pageHtml.push(`<li class="${page==i?'active':''}"><a href="javascript:;" name="myPagerPage" data-page="${i}">${i}</a></li>`);
                    }
                    if(page == 1)
                        dom.find('[name=myPagerPrev]').closest('li').addClass('disabled');
                    if(page >= totalPage)
                        dom.find('[name=myPagerNext]').closest('li').addClass('disabled');
                    dom.find('[name=myPagerPrev]').closest('li').after(pageHtml);
                    dom.find('[name=count]').html(t.count);
                    dom.find('[name=currPage]').html(page + '/' + totalPage);
                    pagerDom.html(dom);
                }
            });
        }
    },
    refresh:function(){
        var self = this;
        self.gotoPage(self.pageIndex);
    }
};