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
        super(new SignInFieldModel(), {
            validConfig: {
                account: {
                    name: '账号',
                    validator: [(val, field) => {
                        if (!val || !val.trim())
                            return { msg: 'required' };
                    }]
                },

                password: {
                    validator: [(val, field) => {
                        if (!val || !val.trim())
                            return { msg: 'required' };
                    }]
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
    constructor() {
        super(new SignUpFieldModel(), {
            validConfig: {
                account: {
                    validator: [(val, field) => {
                        if (!val || !val.trim())
                            return { msg: 'required' };
                    }]
                },
                nickname: {
                    validator: [(val, field) => {
                        if (!val || !val.trim())
                            return { msg: 'required' };
                    }]
                },
                password: {
                    validator: [(val, field) => {
                        if (!val || !val.trim())
                            return { msg: 'required' };
                    }]
                },
                confirmPassword: {
                    validator: [(val, field) => {
                        if (!val || !val.trim())
                            return { msg: 'required' };
                        if (val !== field.password)
                            return { msg: '不一致' };

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