
import { observable, action, runInAction } from 'mobx';

import { Model, required, SelectedObject } from '../../components/Base';
import { myEnum } from '../../config/enum';

class AuthorityQueryFieldModel {
    @observable
    name: string;
    @observable
    code: string;
    @observable
    anyKey: string;
}
export class AuthorityQueryModel extends Model<AuthorityQueryFieldModel> {
    selectedStatus: SelectedObject<{ key: string, value: any }>;
    constructor() {
        super(new AuthorityQueryFieldModel());
        this.init();
    }

    @action
    init() {
        this.field.name = '';
        this.field.code = '';
        this.field.anyKey = '';
        this.selectedStatus = new SelectedObject<{ key: string, value: any }>();
        this.selectedStatus.setItems(myEnum.authorityStatus.toArray());
    }
}

export class AuthorityDetailFieldModel {
    @observable
    _id: string;
    @observable
    name: string;
    @observable
    code: string;
    @observable
    status: number;
}
export class AuthorityDetailModel extends Model<AuthorityDetailFieldModel>{
    codeExistsErr: string;
    constructor() {
        super(new AuthorityDetailFieldModel(), {
            validConfig: {
                name: {
                    validator: [required]
                },

                code: {
                    validator: [required, (val, model: AuthorityDetailModel) => {
                        return model.codeExistsErr;
                    }]
                },
            }
        });
        this.init();
    }

    @action
    init(detail?) {
        let defaultVal = {
            status: myEnum.authorityStatus.启用
        };
        ['_id', 'name', 'code', 'status'].forEach(key => {
            let value = defaultVal[key] || '';
            if (detail && detail.hasOwnProperty(key))
                value = detail[key];
            this.field[key] = value;
        });
    }
}