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

export class SignUpModel extends Model {
    @observable
    account: string;

    @observable
    nickname: string;

    @observable
    password: string;

    @observable
    confirmPassword: string;

    constructor() {
        super();
        this.init();
    }

    @action
    init() {
    }
}