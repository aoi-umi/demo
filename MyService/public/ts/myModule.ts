import * as ejs from 'ejs';

import * as common from './common';
import * as myInterface from './myInterface';
import MyPager from './myPager';

class ModuleBase {
    pagerId?: string;
    queryId?: string;
    queryItemTempId?: string;
    queryContainerId?: string;

    detailId?: string;
    detailContainerName?: string;
    detailTempId?: string;

    saveClass?: string;
    addClass?: string;

    rowClass?: string;
    editClass?: string;
    delClass?: string;
    detailQueryClass?: string;
    itemToDetailClass?: string;
}

export class ModuleOption extends ModuleBase {
    operation?: any[];
    detailUrl?: string;
    interfacePrefix?: string;
    queryArgsOpt?: any[];
    saveDefaultModel?: any;

    init?(self: MyModule);

    bindEvent?(self: MyModule);

    beforeQueryDataCheck?(self: MyModule);

    beforeQuery?(data: any);

    onQuerySuccess?(data: any);

    onQueryFail?(data: any, self: MyModule);

    editBeforeRender?(data: any, self: MyModule);

    editAfterRender?(data: any, self: MyModule);

    beforeSave?(data: any, self: MyModule);

    onSaveSuccess?(data: any, self: MyModule);

    onSaveFail?(data: any, self: MyModule);

    beforeDel?(data: any);

    onDelSuccess?(data: any, self: MyModule);

    onDelFail?(data: any, self: MyModule);

    beforeDetailQuery?(data: any, self: MyModule);

    onDetailQuerySuccess?(data: any, self: MyModule);

    onDetailQueryFail?(data: any, self: MyModule);
}

export class MyModule extends ModuleBase {
    constructor(option) {
        super();
        this.init(option);
    }

    pager: MyPager = null;

    queryDom: JQuery<HTMLElement> = null;
    queryContainerDom: JQuery<HTMLElement> = null;
    queryItemTemp = null;

    detailDom: JQuery<HTMLElement> = null;
    detailQueryDom: JQuery<HTMLElement> = null;
    detailContainerDom: JQuery<HTMLElement> = null;
    detailTemp = null;

    operation = {
        query: false,
        detailQuery: false,
        save: false,
        del: false,
    };
    variable: any = {};
    opt: ModuleOption = {
        //query detailQuery save del
        operation: [],
        pagerId: 'pager',
        queryId: 'query',
        queryItemTempId: 'queryItemTemp',
        queryContainerId: 'queryContainer',

        detailId: 'detail',
        detailContainerName: 'detailContainer',
        detailTempId: 'detailTemp',
        queryArgsOpt: null,

        saveClass: 'save',
        saveDefaultModel: null,
        addClass: 'add',

        rowClass: 'itemRow',
        editClass: 'itemEdit',
        delClass: 'itemDel',
        detailQueryClass: 'itemDetailQuery',
        itemToDetailClass: 'itemToDetail',
        interfacePrefix: '',
        detailUrl: '',

        init: function (self: MyModule) {
        },
        bindEvent: function (self: MyModule) {
        },
        beforeQueryDataCheck: function (self: MyModule) {
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
        onQuerySuccess: function (t) {
        },
        onQueryFail: function (e, self: MyModule) {
            common.msgNotice({type: 1, msg: e.message});
        },
        editBeforeRender: function (item, self: MyModule) {
            return item;
        },
        editAfterRender: function (item, self: MyModule) {
        },
        beforeSave: function (dom, self: MyModule): any {
        },
        onSaveSuccess: function (t, self: MyModule) {
            common.msgNotice({type: 1, msg: '保存成功:' + t});
        },
        onSaveFail: function (e, self: MyModule) {
            common.msgNotice({type: 1, msg: '保存失败:' + e.message});
        },
        beforeDel: function (t) {
        },
        onDelSuccess: function (t, self: MyModule) {
            common.msgNotice({type: 1, msg: '删除成功'});
            self.pager.refresh();
        },
        onDelFail: function (e, self: MyModule) {
            common.msgNotice({type: 1, msg: '删除失败:' + e.message});
        },
        beforeDetailQuery: function (t, self: MyModule) {
            var data: any = {};
            if (t && t.id)
                data.id = t.id;
            return data;
        },
        onDetailQuerySuccess: function (t, self: MyModule) {
            self.detailRender(t);
        },
        onDetailQueryFail: function (e, self: MyModule) {
            common.msgNotice({type: 1, msg: '查询失败:' + e.message});
        }
    };

    private init(option) {
        var self = this;
        self.opt = $.extend(self.opt, option);

        if (self.opt.operation && self.opt.operation.length) {
            $(self.opt.operation).each(function () {
                let ele: any = this;
                self.operation[ele] = true;
            });
        }

        var classList = [
            'rowClass',
            'editClass',
            'delClass',
            'detailQueryClass',
            'saveClass',
            'addClass',
            'itemToDetailClass'
        ];
        $(classList).each(function () {
            let ele: any = this;
            if (self.opt[ele])
                self[ele] = '.' + self.opt[ele];
            else
                self[ele] = '';
        });

        var idList = [
            'pagerId',
            'queryId',
            'queryContainerId',
            'queryItemTempId',
            'detailId',
            'detailTempId',
        ];

        $(idList).each(function () {
            let ele: any = this;
            if (self.opt[ele])
                self[ele] = '#' + self.opt[ele];
            else
                self[ele] = '';
        });
        self.queryDom = $(self.queryId);
        self.queryContainerDom = $(self.queryContainerId);
        self.queryItemTemp = $(self.queryItemTempId).html();

        self.detailDom = $(self.detailId);
        self.detailContainerDom = self.detailDom.find(`[name=${self.opt.detailContainerName}]`);
        self.detailTemp = $(self.detailTempId).html();

        self.opt.init(self);
        self.bindEvent();
        if (self.operation.query) {
            self.pager = new MyPager({
                pagerId: self.opt.pagerId,
                changeHandle: function (cb) {
                    self.query().then(function (t: any) {
                        cb({count: t.count});
                    }).fail(function () {
                        cb();
                    });
                }
            });
            self.queryDom.click();
        }
    }

    private bindEvent() {
        var self = this;

        if (self.operation.query) {
            self.queryDom.on('click', function () {
                self.pager.gotoPage(1);
            });

            if (self.opt.queryArgsOpt) {
                $(self.opt.queryArgsOpt).each(function () {
                    var item: any = this;
                    if (item.dom) {
                        item.dom.on('blur', function () {
                            var checkRes = common.dataCheck({list: [item]});
                            if (checkRes.success) {
                                if (checkRes.dom)
                                    $('[data-target="' + checkRes.dom.selector + '"]').hide();
                            } else {
                                common.msgNotice({dom: checkRes.dom, msg: checkRes.desc});
                            }
                        });

                        item.dom.on('keyup', function (event) {
                            if (event.which == 13)
                                self.queryDom.click();
                        });
                    }
                });
            }

            if (self.itemToDetailClass) {
                $(document).on('click', self.itemToDetailClass, function () {
                    var dom = $(this);
                    var args = {
                        id: 0,
                        noNav: true
                    };
                    if (dom.hasClass(self.opt.addClass)) {
                    } else {
                        args.id = dom.closest(self.rowClass).data('item').id;
                    }
                    var url = self.opt.detailUrl + '?';

                    if (parent && parent['myTab']) {
                        var params = common.getUrlParamsFromArgs(args);
                        var data = {
                            id: self.opt.interfacePrefix + 'Detail' + args.id,
                            name: self.opt.interfacePrefix + (args.id == 0 ? '新增' : '详细:' + args.id),
                            content: url + params
                        };
                        parent['myTab'].addOrOpenTab(data);
                    }
                    else {
                        args.noNav = false;
                        var params = common.getUrlParamsFromArgs(args);
                        window.open(url + params);
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
    }

    query(pageIndex?) {
        var self = this;
        return common.promise(function () {
            var errorDom = self.queryContainerDom.find('.error').hide();
            var data = null;
            var checkRes = self.opt.beforeQueryDataCheck(self);
            if (checkRes) {
                console.log(checkRes)
                var err = null;
                if (!checkRes.success) {
                    if (checkRes.dom) {
                        common.msgNotice({dom: checkRes.dom, msg: checkRes.desc});
                    } else {
                        err = new Error(checkRes.desc);
                    }
                    throw err;
                }
                data = checkRes.model;
            }
            if (!data) data = {};
            data.pageIndex = pageIndex || self.pager.pageIndex;
            data.pageSize = self.pager.pageSize;
            self.opt.beforeQuery(data);
            var method = self.opt.interfacePrefix + 'Query';
            var notice = common.msgNotice({type: 1, msg: '查询中...', noClose: true});
            return myInterface.api[method](data).then(function (t) {
                self.opt.onQuerySuccess(t);
                self.queryContainerDom.find(self.rowClass).remove();
                var temp = self.queryItemTemp;
                $(t.list).each(function (i) {
                    var item: any = this;
                    item.colNum = i + 1;
                    self.queryContainerDom.append($(ejs.render(temp, item)).data('item', item));
                });
                return t;
            }).fail(function (e) {
                self.queryContainerDom.find(self.rowClass).remove();
                if (errorDom.length) {
                    if (e instanceof Error) e = e.message;
                    if (typeof e == 'object') e = JSON.stringify(e);
                    self.queryContainerDom.find('[name=errorContent]').html(e);
                    errorDom.show();
                    e = null;
                }
                throw e;
            }).finally(function () {
                notice.close();
            });
        }).fail(function (e) {
            if (e) {
                console.log(e);
                self.opt.onQueryFail(e, self);
            }
            throw e;
        });
    }

    edit(item?) {
        var self = this;
        if (!item) {
            item = self.opt.saveDefaultModel;
        }
        item = self.opt.editBeforeRender(item, self);
        self.detailRender(item);
        self.opt.editAfterRender(item, self);
    }

    save(dom) {
        var self = this;
        return common.promise(function () {
            var data = null;
            var checkRes = self.opt.beforeSave(dom, self);
            if (checkRes) {
                console.log(checkRes)
                if (!checkRes.success) {
                    var err = null;
                    if (checkRes.dom) {
                        common.msgNotice({dom: checkRes.dom, msg: checkRes.desc});
                    } else {
                        err = new Error(checkRes.desc);
                    }
                    throw err;
                }
                var notice = common.msgNotice({type: 1, msg: '保存中...', noClose: true});
                data = checkRes.model;
                var method = self.opt.interfacePrefix + 'Save';
                return myInterface.api[method](data).then(function (t) {
                    self.opt.onSaveSuccess(t, self);
                    return t;
                }).finally(function () {
                    notice.close();
                });
            }
        }).fail(function (e: any) {
            if (e)
                self.opt.onSaveFail(e, self);
            throw e;
        });
    }

    del(item) {
        var self = this;
        return common.promise(function (defer) {
            common.msgNotice({
                type: 1, msg: '是否删除?',
                btnOptList: [{
                    content: '确认',
                    cb: function () {
                        defer.resolve();
                    }
                }, {
                    content: '取消',
                    cb: function () {
                    }
                }]
            });
            return defer.promise;
        }).then(function () {
            var notice = common.msgNotice({type: 1, msg: '删除中...', noClose: true});
            var data: any = {};
            if (item && item.id)
                data.id = item.id;
            self.opt.beforeDel(data);
            var method = self.opt.interfacePrefix + 'Del';
            return myInterface.api[method](data).then(function (t) {
                self.opt.onDelSuccess(t, self);
            }).fail(function (e) {
                self.opt.onDelFail(e, self);
            }).finally(function () {
                notice.close();
            });
        });
    }

    detailQuery(item) {
        var self = this;
        return common.promise(function () {
            var notice = common.msgNotice({type: 1, msg: '查询中...', noClose: true});
            var data = self.opt.beforeDetailQuery(item, self);
            var method = self.opt.interfacePrefix + 'DetailQuery';
            return myInterface.api[method](data).then(function (t) {
                self.opt.onDetailQuerySuccess(t, self);
            }).fail(function (e) {
                self.opt.onDetailQueryFail(e, self);
            }).finally(function () {
                notice.close();
            });
        });
    }

    detailRender(item) {
        var self = this;
        var temp = self.detailTemp;
        self.detailContainerDom.html(ejs.render(temp, item));
    }
}