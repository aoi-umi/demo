
import { observable, action, runInAction } from 'mobx';

import { QueryModel } from '../../components/MyList';
export class BookmarkQueryModel extends QueryModel {
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