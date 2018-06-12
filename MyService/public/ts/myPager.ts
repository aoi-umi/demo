/**
 * Created by umi on 2017-9-10.
 */
interface MyPagerOption {
    pagerId?: string;
    maxPageCount?: number;
    pageIndex?: number;
    pageSize?: number;
    pageSizeList?: number[];
    template?: string;
    changeHandle?: Function;
}

export default class MyPager {
    constructor(option: MyPagerOption) {
        this.init(option)
    }

    opt: MyPagerOption = {
        pagerId: 'pager',
        maxPageCount: 5,
        pageIndex: 1,
        pageSize: 10,
        template:
            `<div class="form-inline pull-right">
                <ul class="pagination pull-left">
                    <li class="my-pager-prev"><a name="myPagerFirst" href="javascript:;">first</a></li>
                    <li class="my-pager-prev"><a name="myPagerPrev" href="javascript:;">&laquo;</a></li>
                    <li class="my-pager-next"><a name="myPagerNext" href="javascript:;">&raquo;</a></li>
                    <li class="my-pager-next"><a name="myPagerLast" href="javascript:;">last</a></li>
                    <li><span style="margin-left:5px" name="count">0</span></li>
                    <li><span style="margin-right:5px" name="currPage">1/1</span></li>                    
                </ul>
                <div name="myPagerPageSizeBox" class="input-group pull-left hidden" style="margin:20px 2px 20px 0px;">               
                    <select name="myPagerPageSize" class="form-control"></select>
                </div>
                <div class="input-group pull-left" style="width:100px;margin:20px 0;">
                    <input name="myPagerGotoInput" class="form-control" type="text"/>
                    <span class="input-group-btn">
                        <button name="myPagerGotoBtn" class="btn btn-default" type="button">go</button>
                    </span>
                </div>
            </div>`,
        changeHandle: null,
        pageSizeList: [10, 20, 30]
    };
    pageIndex: number;
    pageSize: number;
    totalPage: number;
    pagerDom: JQuery<HTMLElement>;

    init(option) {
        var self = this;
        var opt = $.extend(self.opt, option) as MyPagerOption;
        self.pageIndex = opt.pageIndex;
        self.pageSize = opt.pageSize;
        self.pagerDom = $('#' + self.opt.pagerId);
        self.bindEvent();
    }

    bindEvent() {
        var self = this;
        var pagerDom = self.pagerDom;
        pagerDom.on('click', '[name=myPagerGotoBtn]', function () {
            var page = pagerDom.find('[name=myPagerGotoInput]').val();
            self.gotoPage(page);
        }).on('click', '[name=myPagerPage]', function () {
            var page = $(this).data('page');
            self.gotoPage(page);
        }).on('click', 'li:not(.disabled) [name=myPagerFirst]', function () {
            self.gotoPage(1);
        }).on('click', 'li:not(.disabled) [name=myPagerPrev]', function () {
            self.gotoPage(self.pageIndex - 1);
        }).on('click', 'li:not(.disabled) [name=myPagerNext]', function () {
            self.gotoPage(self.pageIndex + 1);
        }).on('click', 'li:not(.disabled) [name=myPagerLast]', function () {
            self.gotoPage(self.totalPage);
        }).on('change', '[name=myPagerPageSize]', function () {
            self.pageSize = parseInt($(this).val() as string);
        });
    }

    gotoPage(page) {
        var self = this;
        var opt = self.opt;
        var pagerDom = self.pagerDom;
        page = parseInt(page);
        if (isNaN(page) || page <= 0) {
            throw new Error('page must be a int and large than 0');
        } else {
            if (opt.changeHandle) {
                self.pageIndex = page;
                opt.changeHandle(function (t) {
                    if (t && t.count) {
                        pagerDom.empty();
                        var dom = $(opt.template);
                        var totalPage = self.totalPage = Math.ceil(t.count / self.pageSize);
                        var pageHtml = [];
                        var pageStart = 1;
                        var pageEnd = totalPage;
                        if (totalPage + 1 - page > opt.maxPageCount) {
                            pageStart = page;
                            pageEnd = page + opt.maxPageCount - 1;
                        }
                        if (page > opt.maxPageCount && pageEnd - pageStart > opt.maxPageCount) {
                            pageStart = pageEnd - opt.maxPageCount + 1;
                        }
                        for (var i = pageStart; i <= pageEnd; i++) {
                            pageHtml.push(`<li class="${page == i ? 'active' : ''}"><a href="javascript:;" name="myPagerPage" data-page="${i}">${i}</a></li>`);
                        }
                        if (page == 1)
                            dom.find('.my-pager-prev').addClass('disabled');
                        if (page >= totalPage)
                            dom.find('.my-pager-next').addClass('disabled');
                        dom.find('[name=myPagerPrev]').closest('li').after(pageHtml);
                        dom.find('[name=count]').html(t.count);
                        dom.find('[name=currPage]').html(page + '/' + totalPage);
                        if (opt.pageSizeList && opt.pageSizeList.length) {
                            dom.find('[name=myPagerPageSizeBox]').removeClass('hidden');
                            let html = [];
                            $(opt.pageSizeList).each(function () {
                                let pageSize = this as any;
                                html.push(`<option value="${pageSize}" ${self.pageSize == pageSize ? "selected" : ""}>${pageSize}</option>`);
                            });
                            dom.find('[name=myPagerPageSize]').html(html.join(''));
                        }
                        //@ts-ignore
                        pagerDom.html(dom);
                    }
                });
            }
        }
    }

    refresh() {
        var self = this;
        self.gotoPage(self.pageIndex);
    }
}