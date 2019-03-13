
import { observable, action, runInAction } from 'mobx';

import { Model } from '../../components/Base';

class BookmarkQueryFieldModel {
    @observable
    name: string;
    @observable
    url: string;
    @observable
    anyKey: string;
}
export class BookmarkQueryModel extends Model<BookmarkQueryFieldModel> {
    constructor() {
        super(new BookmarkQueryFieldModel());
        this.init();
    }

    @action
    init() {
        this.field.name = '';
        this.field.url = '';
        this.field.anyKey = '';
    }
}

export type BookmarkShowTag = {
    tag: string,
    status: number,/*0, 1 新增, -1 删除,*/
    origStatus: number,
};

class BookmarkDetailFieldModel {
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
}
export class BookmarkDetailModel extends Model<BookmarkDetailFieldModel>{
    constructor() {
        super(new BookmarkDetailFieldModel());
        this.init();
    }

    @action
    init(detail?) {
        this.field.tag = '';
        this.field.tagList = [];
        ['_id', 'name', 'url'].forEach(key => {
            this[key] = (detail && detail[key]) || '';
        });
        if (detail) {
            if (detail.tagList)
                this.field.tagList = detail.tagList;
        }
        this.field.showTagList = this.field.tagList.map(tag => {
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
            this.field.showTagList.push(val);
        else
            this.field.showTagList[idx] = val;
    }
}