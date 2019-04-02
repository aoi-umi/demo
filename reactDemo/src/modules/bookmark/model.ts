
import { observable, action, runInAction } from 'mobx';

import { Model, required } from '../../components/Base';
import { TagType, TagModel } from '../components';

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
    tag: string;
}
export class BookmarkDetailModel extends Model<BookmarkDetailFieldModel>{

    tagModel: TagModel;
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
    }

    @action
    init(detail?) {
        this.field.tag = '';
        let defaultVal = {
            tagList: []
        };
        ['_id', 'name', 'url', 'tagList'].forEach(key => {
            let value = defaultVal.hasOwnProperty(key) ? defaultVal[key] : '';
            if (detail && detail.hasOwnProperty(key))
                value = detail[key];
            this.field[key] = value;
        });
        if (!this.tagModel)
            this.tagModel = new TagModel();
        this.tagModel.setTagList(this.field.tagList.map(tag => {
            return {
                label: tag,
            };
        }));
    }
}