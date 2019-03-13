import { observable, action, runInAction } from 'mobx';
import { Model } from '../../components/Base';

class SignInFieldModel {
    @observable
    account: string;

    @observable
    password: string;
}
export class SignInModel extends Model<SignInFieldModel> {
    constructor() {
        super(new SignInFieldModel());
        this.init();
    }

    @action
    init() {
    }
}

class SignUpFieldModel {
    @observable
    account: string;

    @observable
    nickname: string;

    @observable
    password: string;

    @observable
    confirmPassword: string;
}

export class SignUpModel extends Model<SignUpFieldModel> {
    constructor() {
        super(new SignUpFieldModel());
        this.init();
    }

    @action
    init() {
    }
}