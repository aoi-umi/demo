import { observable, action, runInAction } from 'mobx';
import { Model } from '../../components/Base';

export class SignInModel extends Model {
    @observable
    account: string;

    @observable
    password: string;

    constructor() {
        super();
        this.init();
    }

    @action
    init() {
    }
}