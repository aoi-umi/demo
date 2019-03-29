import { observable, action, runInAction } from 'mobx';
import lang from '../../lang';
import { Model, required } from '../../components/Base';

class SignInFieldModel {
    @observable
    account: string;

    @observable
    password: string;
}
export class SignInModel extends Model<SignInFieldModel> {
    constructor() {
        super(new SignInFieldModel(), {
            validConfig: {
                account: {
                    validator: [required]
                },

                password: {
                    validator: [required]
                },
            }
        });
    }

    @action
    init() {
        this.field.account = '';
        this.field.password = '';
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
    accountExistsErr: string;
    constructor() {
        super(new SignUpFieldModel(), {
            validConfig: {
                account: {
                    validator: [required, (val, model: SignUpModel) => {
                        return model.accountExistsErr;
                    }]
                },
                nickname: {
                    validator: [required]
                },
                password: {
                    validator: [required]
                },
                confirmPassword: {
                    validator: [required,
                        (val, field) => {
                            if (val !== field.password)
                                return lang.User.operate.passwordNotSame;
                        }]
                },
            }
        });
    }

    @action
    init() {
        this.field.account = '';
        this.field.nickname = '';
        this.field.password = '';
        this.field.confirmPassword = '';
    }
}