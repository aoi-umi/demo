/**
 * Created by bang on 2017-9-11.
 */
namespace('module');
module = function(option) {
    this.init(option);
};
module.prototype = {
    pager: null,

    queryDom: null,
    queryContainerDom: null,
    queryItemTemp: null,

    detailQueryDom: null,
    detailContainerDom: null,
    detailTemp: null,

    saveDom: null,
    addDom: null,

    rowClass:'',
    editClass:'',

    operation: {
        query: false,
        detailQuery: false,
        save: false,
        del: false,
    },
    opt: {
        //query detailQuery save del
        operation: ['query'],
        pagerId: 'pager',
        queryId: 'query',
        queryItemTempId: 'queryItemTemp',
        queryContainerId: 'queryContainer',

        detailContainerId: 'detailContainer',
        detailTempId: 'detailTemp',

        saveId: 'save',
        saveDefaultModel: null,
        addId: 'add',

        rowClass: 'itemRow',
        editClass: 'itemEdit',
        interfacePrefix: '',

        bindEvent: function(self){},
        beforeQuery: function(){},
        beforeEdit: function(item){},
        afterEdit: function(item){},
        beforeSave: function(){},
        onSaveSuccess: function(t){}
    },
    init: function (option) {
        var self = this;
        var opt = $.extend(self.opt, option);

        if (self.opt.operation && self.opt.operation.length) {
            $(self.opt.operation).each(function () {
                self.operation[this] = true;
            });
        }

        if(self.opt.rowClass)
            self.rowClass = '.' + self.opt.rowClass;
        if(self.opt.editClass)
            self.editClass = '.' + self.opt.editClass;

        self.queryDom = $('#' + self.opt.queryId);
        self.queryContainerDom = $('#' + self.opt.queryContainerId);
        self.queryItemTemp = $('#' + self.opt.queryItemTempId).html();

        self.detailContainerDom = $('#' + self.opt.detailContainerId);
        self.detailTemp = $('#' + self.opt.detailTempId).html();

        self.saveDom = $('#' + self.opt.saveId);
        self.addDom = $('#' + self.opt.addId);


        self.bindEvent();
        if (self.operation.query) {
            self.pager = new my.pager({
                pagerId: self.opt.pagerId,
                changeHandle: function (cb) {
                    self.query().then(function (t) {
                        cb({count: t.count});
                    }).fail(function () {
                        cb();
                    });
                }
            });
            self.queryDom.click();
        }
    },
    bindEvent: function () {
        var self = this;

        if(self.operation.query){
            self.queryDom.on('click', function () {
                self.pager.gotoPage(1);
            });
        }

        if(self.operation.detailQuery){

        }

        if(self.operation.save){
            self.addDom.on('click', function () {
                self.edit();
            });

            if(self.operation.query){
                self.queryContainerDom.on('click', self.editClass, function () {
                    var row = $(this).closest(self.rowClass);
                    self.edit(row.data('item'));
                });
            }

            self.saveDom.on('click', function () {
                self.save();
            });
        }

        if(self.operation.del){

        }
        self.opt.bindEvent(self);
    },
    query: function (pageIndex) {
        var self = this;
        self.queryContainerDom.find('.error').addClass('hidden');
        try {
            var data = null;
            var checkRes = self.opt.beforeQuery();
            if (checkRes) {
                console.log(checkRes)
                if (!checkRes.success) {
                    if (checkRes.dom) {
                        extend.msgNotice({target: checkRes.dom.selector, msg: checkRes.desc});
                    } else {
                        throw new Error(checkRes.desc);
                    }
                    return $.Deferred().reject();
                }
                data = checkRes.model;
                data.page_index = pageIndex || self.pager.pageIndex;
                data.page_size = self.pager.pageSize;
                var method = self.opt.interfacePrefix + 'Query';
                return my.interface[method](data).then(function (t) {
                    self.queryContainerDom.find(self.rowClass).remove();
                    var temp = self.queryItemTemp;
                    $(t.list).each(function (i) {
                        var item = this;
                        item.colNum = i + 1;
                        self.queryContainerDom.append($(ejs.render(temp, item)).data('item', item));
                    });
                    return t;
                }).fail(function (e) {
                    self.queryContainerDom.find(self.rowClass).remove();
                    if (e instanceof Error) e = e.message;
                    if (typeof e == 'object') e = JSON.stringify(e);
                    self.queryContainerDom.find('[name=errorContent]').html(e);
                    self.queryContainerDom.find('.error').removeClass('hidden');
                });
            }
        }catch(e){
            extend.msgNotice({type: 1, msg: e.message});
        }
    },
    edit: function (item) {
        var self = this;
        if (!item) {
            item = self.opt.saveDefaultModel;
        }
        self.opt.beforeEdit(item);
        var temp = self.detailTemp;
        self.detailContainerDom.html(ejs.render(temp, item));
        self.opt.afterEdit(item);
    },
    save: function () {
        var self = this;
        var data = null;
        try {
            var checkRes = self.opt.beforeSave();
            if (checkRes) {
                console.log(checkRes)
                if (!checkRes.success) {
                    if (checkRes.dom) {
                        extend.msgNotice({target: checkRes.dom.selector, msg: checkRes.desc});
                    } else {
                        throw new Error(checkRes.desc);
                    }
                    return;
                }
                data = checkRes.model;
                var method = self.opt.interfacePrefix + 'Save';
                my.interface[method](data).then(function (t) {
                    self.opt.onSaveSuccess(t);
                }).fail(function (e) {
                    console.log(e)
                    extend.msgNotice({type: 1, msg: e.message});
                });
            }
        }catch(e){
            extend.msgNotice({type: 1, msg: e.message});
        }
    }
};