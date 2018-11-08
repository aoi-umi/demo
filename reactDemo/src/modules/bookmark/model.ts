
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


export class BookmarkDetailModel extends Model {
    @observable
    _id: string;
    @observable
    name: string;
    @observable
    url: string;

    @action
    init(detail?) {
        ['_id', 'name', 'url'].forEach(key => {
            this[key] = (detail && detail[key]) || '';
        });
    }
}