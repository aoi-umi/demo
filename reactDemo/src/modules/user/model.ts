import { observable, action, runInAction } from 'mobx';
import lang from '../../lang';
import { Model, required } from '../../components/Base';
import { TagModel } from '../components';
import { AuthorityDetailFieldModel } from '../authority/model';
import { myEnum } from '../../config/enum';
import { RoleDetailFieldModel } from '../role/model';

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


class UserMgtDetailFieldModel {
    @observable
    _id: string;
    @observable
    nickname: string;
    @observable
    account: string;

    @observable
    authority: string;
    @observable
    authorityList: AuthorityDetailFieldModel[];

    @observable
    role: string;
    @observable
    roleList: RoleDetailFieldModel[];
}

export class UserMgtDetailModel extends Model<UserMgtDetailFieldModel>{
    authorityTagModel: TagModel;
    roleTagModel: TagModel;
    constructor() {
        super(new UserMgtDetailFieldModel());
        this.authorityTagModel = new TagModel();
        this.roleTagModel = new TagModel();
    }

    @action
    init(detail) {
        if (detail) {
            ['_id', 'nickname', 'roleList', 'authorityList'].forEach(key => {
                let value = detail[key];
                this.field[key] = value;
            });
            this.authorityTagModel.setTagList(this.field.authorityList.map(authority => {
                return {
                    label: authority.name,
                    id: authority.code,
                    disabled: authority.status !== myEnum.authorityStatus.启用
                };
            }));
            this.roleTagModel.setTagList(this.field.roleList.map(role => {
                return {
                    label: role.name,
                    id: role.code,
                    disabled: role.status !== myEnum.roleStatus.启用
                };
            }));
        }
    }
}