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

    operation: {
        query: false,
        detailQuery: false,
        save: false,
        del: false,
    },
    variable: {},
    opt: {
        //query detailQuery save del
        operation: [],
        pagerId: 'pager',
        queryId: 'query',
        queryItemTempId: 'queryItemTemp',
        queryContainerId: 'queryContainer',

        detailContainerId: 'detailContainer',
        detailTempId: 'detailTemp',
        queryArgsOpt: null,

        saveClass: 'save',
        saveDefaultModel: null,
        addClass: 'add',

        rowClass: 'itemRow',
        editClass: 'itemEdit',
        delClass: 'itemDel',
        detailQueryClass: 'itemDetailQuery',
        interfacePrefix: '',

        init: function (self) {
        },
        bindEvent: function (self) {
        },
        beforeQueryDataCheck: function (self) {
            var list = self.opt.queryArgsOpt;
            if (list) {
                var checkRes = common.dataCheck({list: list});
                if (checkRes.success) {
                    var data = checkRes.model;
                }
                return checkRes;
            }
        },
        beforeQuery: function (t) {
        },
        onQueryFail: function (e, self) {
            common.msgNotice({type: 1, msg: e.message});
        },
        beforeEdit: function (item, self) {
            return item;
        },
        afterEdit: function (item) {
        },
        beforeSave: function (dom, self) {
        },
        onSaveSuccess: function (t, self) {
            common.msgNotice({type: 1, msg: '保存成功:' + t});
        },
        onSaveFail: function (e, self) {
            common.msgNotice({type: 1, msg: '保存失败:' + e.message});
        },
        beforeDel: function (t) {
        },
        onDelSuccess: function (t, self) {
            common.msgNotice({type: 1, msg: '删除成功'});
            self.pager.refresh();
        },
        onDelFail: function (e, self) {
            common.msgNotice({type: 1, msg: '删除失败:' + e.message});
        },
        beforeDetailQuery: function (t) {
        },
        onDetailQuerySuccess: function (t, self) {
            self.detailRender(t);
        },
        onDetailQueryFail: function (e, self) {
            common.msgNotice({type: 1, msg: '查询失败:' + e.message});
        }
    },
    init: function (option) {
        var self = this;
        self.opt = $.extend(self.opt, option);

        if (self.opt.operation && self.opt.operation.length) {
            $(self.opt.operation).each(function () {
                self.operation[this] = true;
            });
        }

        var classList = [
            'rowClass',
            'editClass',
            'delClass',
            'detailQueryClass',
            'saveClass',
            'addClass'
        ];
        $(classList).each(function(){
            if(self.opt[this])
                self[this] = '.' + self.opt[this];
            else
                self[this] = '';
        });

        var idList = [
            'queryId',
            'queryContainerId',
            'queryItemTempId',
            'detailContainerId',
            'detailTempId',
        ];

        $(idList).each(function(){
            if(self.opt[this])
                self[this] = '#' + self.opt[this];
            else
                self[this] = '';
        });
        self.queryDom = $(self.queryId);
        self.queryContainerDom = $(self.queryContainerId);
        self.queryItemTemp = $(self.queryItemTempId).html();

        self.detailContainerDom = $(self.detailContainerId);
        self.detailTemp = $(self.detailTempId).html();

        self.opt.init(self);
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

        if (self.operation.query) {
            self.queryDom.on('click', function () {
                self.pager.gotoPage(1);
            });

            if (self.opt.queryArgsOpt) {
                $(self.opt.queryArgsOpt).each(function () {
                    var item = this;
                    if (item.dom) {
                        item.dom.on('blur', function () {
                            var checkRes = common.dataCheck({list: [item]});
                            if (checkRes.success) {
                                $('[data-target="' + checkRes.dom.selector + '"]').hide();
                            } else {
                                common.msgNotice({target: checkRes.dom.selector, msg: checkRes.desc});
                            }
                        });
                    }
                });
            }
        }

        if (self.operation.save) {
            $(document).on('click', self.addClass, function () {
                self.edit();
            });

            if (self.operation.query) {
                self.queryContainerDom.on('click', self.editClass, function () {
                    var row = $(this).closest(self.rowClass);
                    self.edit(row.data('item'));
                });
            }

            $(document).on('click', self.saveClass, function () {
                self.save($(this));
            });
        }

        if (self.operation.detailQuery) {
            self.queryContainerDom.on('click', self.detailQueryClass, function () {
                var row = $(this).closest(self.rowClass);
                self.detailQuery(row.data('item'));
            });
        }

        if (self.operation.del) {
            self.queryContainerDom.on('click', self.delClass, function () {
                var row = $(this).closest(self.rowClass);
                self.del(row.data('item'));
            });
        }
        self.opt.bindEvent(self);
    },
    query: function (pageIndex) {
        var self = this;
        return common.promise().then(function (res) {
            var errorDom = self.queryContainerDom.find('.error').hide();
            var data = null;
            var checkRes = self.opt.beforeQueryDataCheck(self);
            if (checkRes) {
                console.log(checkRes)
                var err = null;
                if (!checkRes.success) {
                    if (checkRes.dom) {
                        common.msgNotice({target: checkRes.dom.selector, msg: checkRes.desc});
                    } else {
                        err = new Error(checkRes.desc);
                    }
                    return $.Deferred().reject(err);
                }
                data = checkRes.model;
            }
            if (!data) data = {};
            data.page_index = pageIndex || self.pager.pageIndex;
            data.page_size = self.pager.pageSize;
            self.opt.beforeQuery(data);
            var method = self.opt.interfacePrefix + 'Query';
            var notice = common.msgNotice({type: 1, msg: '查询中...', noClose: true});
            my.interface[method](data).then(function (t) {
                self.queryContainerDom.find(self.rowClass).remove();
                var temp = self.queryItemTemp;
                $(t.list).each(function (i) {
                    var item = this;
                    item.colNum = i + 1;
                    self.queryContainerDom.append($(ejs.render(temp, item)).data('item', item));
                });
                return res.resolve(t);
            }).fail(function (e) {
                self.queryContainerDom.find(self.rowClass).remove();
                if (errorDom.length) {
                    if (e instanceof Error) e = e.message;
                    if (typeof e == 'object') e = JSON.stringify(e);
                    self.queryContainerDom.find('[name=errorContent]').html(e);
                    errorDom.show();
                    e = null;
                }
                return res.reject(e);
            }).always(function () {
                notice.close();
            });
            return res;
        }).fail(function (e) {
            if (e) {
                console.log(e);
                self.opt.onQueryFail(e, self);
            }
        });
    },
    edit: function (item) {
        var self = this;
        if (!item) {
            item = self.opt.saveDefaultModel;
        }
        item = self.opt.beforeEdit(item, self);
        self.detailRender(item);
        self.opt.afterEdit(item);
    },
    save: function (dom) {
        var self = this;
        return common.promise().then(function (res) {
            var data = null;
            try{
                var checkRes = self.opt.beforeSave(dom, self);
                if (checkRes) {
                    console.log(checkRes)
                    if (!checkRes.success) {
                        var err = null;
                        if (checkRes.dom) {
                            common.msgNotice({target: checkRes.dom.selector, msg: checkRes.desc});
                        } else {
                            err = new Error(checkRes.desc);
                        }
                        throw err;
                    }
                    var notice = common.msgNotice({type: 1, msg: '保存中...', noClose: true});
                    data = checkRes.model;
                    var method = self.opt.interfacePrefix + 'Save';
                    my.interface[method](data).then(function (t) {
                        self.opt.onSaveSuccess(t, self);
                        return res.resolve(t);
                    }).fail(function (e) {
                        self.opt.onSaveFail(e, self);
                        return res.reject();
                    }).always(function () {
                        notice.close();
                    });
                    return res;
                }
            }catch (e) {
                return $.Deferred().reject(e);
            }
        }).fail(function (e) {
            if (e)
                common.msgNotice({type: 1, msg: e.message});
        });
    },
    del: function (item) {
        var self = this;
        return common.promise().then(function (res) {
            common.msgNotice({
                type: 1, msg: '是否删除?',
                btnOptList: [{
                    content: '确认',
                    cb: function () {
                        res.resolve();
                    }
                }, {
                    content: '取消',
                    cb: function () {
                    }
                }]
            });
            return res;
        }).then(function () {
            var notice = common.msgNotice({type: 1, msg: '删除中...', noClose: true});
            var data = {};
            if (item && item.id)
                data.id = item.id;
            self.opt.beforeDel(data);
            var method = self.opt.interfacePrefix + 'Del';
            return my.interface[method](data).then(function (t) {
                self.opt.onDelSuccess(t, self);
            }).fail(function (e) {
                self.opt.onDelFail(e, self);
            }).always(function () {
                notice.close();
            });
        });
    },
    detailQuery: function (item) {
        var self = this;
        return common.promise().then(function (res) {
            var notice = common.msgNotice({type: 1, msg: '查询中...', noClose: true});
            var data = {};
            if (item && item.id)
                data.id = item.id;
            self.opt.beforeDetailQuery(data);
            var method = self.opt.interfacePrefix + 'DetailQuery';
            return my.interface[method](data).then(function (t) {
                self.opt.onDetailQuerySuccess(t, self);
            }).fail(function (e) {
                self.opt.onDetailQueryFail(e, self);
            }).always(function () {
                notice.close();
            });
        });
    },
    detailRender: function (item) {
        var self = this;
        var temp = self.detailTemp;
        self.detailContainerDom.html(ejs.render(temp, item));
    }
};