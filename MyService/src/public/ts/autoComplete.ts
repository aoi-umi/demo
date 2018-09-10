import * as $ from 'jquery';
import * as ejs from 'ejs';

import * as common from './common';
import * as myInterface from './myInterface';

//权限autoComplete
export class AuthorityAutoComplete {
    excludeByUserId: number;
    excludeByRoleCode: string;
    templateId: string = 'authorityLabelTemp';
    readonly labelName: string;
    private dom: JQuery<HTMLElement>;
    private renderDom: JQuery<HTMLElement>;

    constructor(opt: {
        dom: JQuery<HTMLElement>,
        renderDom?: JQuery<HTMLElement>,
        labelName?: string,
        templateId?: string,
        select?: (dom, item) => void;
    }) {
        this.dom = opt.dom;
        this.renderDom = opt.renderDom;
        this.labelName = opt.labelName;
        if (opt.select)
            this.select = opt.select;
        if (opt.templateId)
            this.templateId = opt.templateId;
        this.setAuthorityAutoComplete();
    }

    private select(dom, item) {
        var match = this.renderDom.find(`[name=${this.labelName}][data-code=${item.code}]`);
        if (!match.length) {
            item.changeStatus = 1;
            this.setAuthority(item);
        }
        dom.blur();
    }

    private setAuthorityAutoComplete() {
        let self = this;
        common.autoComplete({
            source: function () {
                return self.getAuthority({anyKey: self.dom.val()});
            },
            dom: self.dom,
            select: self.select.bind(self),
            renderItem: function (ul, item) {
                return $('<li>').append(`<div>${item.code}${item.name ? '(' + item.name + ')' : ''}</div>`).appendTo(ul);
            },
            match: function () {
                return true;
            }
        });
    }

    private getAuthority(opt) {
        let self = this;
        var queryOpt: any = {
            excludeByUserId: self.excludeByUserId,
            excludeByRoleCode: self.excludeByRoleCode,
            noOperation: true,
        };
        if (opt)
            queryOpt.anyKey = opt.anyKey;
        return myInterface.api.authority.query(queryOpt).then(function (t) {
            return t.list;
        });
    }

    setAuthority(item) {
        var self = this;
        item.labelName = this.labelName;
        if (!item.changeStatus)
            item.changeStatus = 0;
        var temp = $(`#${this.templateId}`).html();
        var dom = $(ejs.render(temp, item));
        dom.data('item', item);
        self.renderDom.append(dom);
    }
}

//角色
export class RoleAutoComplete {
    excludeByUserId: number;
    templateId: string = "roleLabelTemp";
    readonly labelName: string;
    private dom: JQuery<HTMLElement>;
    private renderDom: JQuery<HTMLElement>;

    constructor(opt: {
        dom: JQuery<HTMLElement>,
        renderDom?: JQuery<HTMLElement>,
        labelName?: string,
        templateId?: string,
        select?: (dom, item) => void;
    }) {
        this.dom = opt.dom;
        this.renderDom = opt.renderDom;
        this.labelName = opt.labelName;
        if (opt.select)
            this.select = opt.select;
        if (opt.templateId)
            this.templateId = opt.templateId;
        this.setAuthorityAutoComplete();
    }

    private select(dom, item) {
        var match = this.renderDom.find(`[name=${this.labelName}][data-code=${item.code}]`);
        if (!match.length) {
            item.changeStatus = 1;
            this.setRole(item);
        }
        dom.blur();
    }

    private setAuthorityAutoComplete() {
        let self = this;
        common.autoComplete({
            source: function () {
                return self.getRole({anyKey: self.dom.val()});
            },
            dom: self.dom,
            select: self.select.bind(self),
            renderItem: function (ul, item) {
                return $('<li>').append(`<div>${item.code}${item.name ? '(' + item.name + ')' : ''}</div>`).appendTo(ul);
            },
            match: function () {
                return true;
            }
        });
    }

    private getRole(opt) {
        let self = this;
        var queryOpt: any = {
            excludeByUserId: self.excludeByUserId,
            noOperation: true,
        };
        if (opt) queryOpt.anyKey = opt.anyKey;
        return myInterface.api.role.query(queryOpt).then(function (t) {
            return t.list;
        });
    }

    setRole(item) {
        item.labelName = 'userRole';
        if (!item.changeStatus)
            item.changeStatus = 0;
        var temp = $(`#${this.templateId}`).html();
        var dom = $(ejs.render(temp, item));
        dom.data('item', item);
        this.renderDom.append(dom);
    }
}