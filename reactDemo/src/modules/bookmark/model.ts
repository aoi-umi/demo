
import { observable, action, runInAction } from 'mobx';

import { Model } from '../../components/MyList';
export class BookmarkQueryModel extends Model {
    @observable
    name: string;
    @observable
    url: string;
    @observable
    anyKey: string;

    @action
    init() {
        this.name = '';
        this.url = '';
        this.anyKey = '';
    }
}

export type BookmarkShowTag = {
    tag: string,
    status: number,/*0, 1 新增, -1 删除,*/
    origStatus: number,
};
export class BookmarkDetailModel extends Model {
    @observable
    _id: string;
    @observable
    name: string;
    @observable
    url: string;

    tagList: string[];
    @observable
    showTagList: BookmarkShowTag[];

    @observable
    tag: string;

    constructor() {
        super();
        this.init();
    }

    @action
    init(detail?) {
        this.tag = '';
        this.tagList = [];
        ['_id', 'name', 'url'].forEach(key => {
            this[key] = (detail && detail[key]) || '';
        });
        if (detail) {
            if (detail.tagList)
                this.tagList = detail.tagList;
        }
        this.showTagList = this.tagList.map(tag => {
            return {
                tag,
                status: 0,
                origStatus: 0
            };
        });
    }

    @action
    changeShowTag(val, idx?: number) {
        if (idx === undefined || idx < 0)
            this.showTagList.push(val);
        else
            this.showTagList[idx] = val;
    }
}