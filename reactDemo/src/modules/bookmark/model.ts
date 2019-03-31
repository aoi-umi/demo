
import { observable, action, runInAction } from 'mobx';

import { Model, required } from '../../components/Base';
import { TagType } from '../components';

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

class BookmarkDetailFieldModel {
    @observable
    _id: string;
    @observable
    name: string;
    @observable
    url: string;

    tagList: string[];
    @observable
    showTagList: TagType[];

    @observable
    tag: string;
}
export class BookmarkDetailModel extends Model<BookmarkDetailFieldModel>{
    constructor() {
        super(new BookmarkDetailFieldModel(), {
            validConfig: {
                name: {
                    validator: [required]
                },

                url: {
                    validator: [required]
                },
            }
        });
        this.init();
    }

    @action
    init(detail?) {
        this.field.tag = '';
        this.field.tagList = [];
        ['_id', 'name', 'url'].forEach(key => {
            this.field[key] = (detail && detail[key]) || '';
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