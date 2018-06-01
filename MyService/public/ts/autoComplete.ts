import * as $ from 'jquery';
import * as ejs from 'ejs';

import * as common from './common';
import * as myInterface from './myInterface';

export class AuthorityAutoComplete {
    excludeByUserId: number;
    excludeByRoleCode: string;
    readonly labelName: string;
    private dom: () => JQuery<HTMLElement>;
    private renderDom: () => JQuery<HTMLElement>;

    constructor(opt: {
        dom: () => JQuery<HTMLElement>,
        renderDom: () => JQuery<HTMLElement>,
        labelName: string
        onSelected?: (dom, item) => void;
    }) {
        this.dom = opt.dom;
        this.renderDom = opt.renderDom;
        this.labelName = opt.labelName;
        if (opt.onSelected)
            this.onSelected = opt.onSelected;
        this.setAuthorityAutoComplete();
    }

    private onSelected(dom, item) {
        var match = this.renderDom().find(`[name=${this.labelName}][data-code=${item.code}]`);
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
                return self.getAuthority({anyKey: this.dom.val()});
            },
            dom: self.dom(),
            select: self.onSelected.bind(self),
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
            excludeByRoleCode: self.excludeByRoleCode
        };
        if (opt)
            queryOpt.anyKey = opt.anyKey;
        return myInterface.api.authorityQuery(queryOpt).then(function (t) {
            return t.list;
        });
    }

    setAuthority(item) {
        var self = this;
        item.labelName = this.labelName;
        if (!item.changeStatus)
            item.changeStatus = 0;
        var temp = $('#authorityLabelTemp').html();
        var dom = $(ejs.render(temp, item));
        dom.data('item', item);
        self.renderDom().append(dom);
    }
}