
import { observable, action, runInAction } from 'mobx';

import { Model, required } from '../../components/Base';
import { myEnum } from '../../config/enum';
import { AuthorityDetailFieldModel } from '../authority/model';

class RoleQueryFieldModel {
    @observable
    name: string;
    @observable
    code: string;
    @observable
    anyKey: string;
}
export class RoleQueryModel extends Model<RoleQueryFieldModel> {
    constructor() {
        super(new RoleQueryFieldModel());
        this.init();
    }

    @action
    init() {
        this.field.name = '';
        this.field.code = '';
        this.field.anyKey = '';
    }
}

class RoleDetailFieldModel {
    @observable
    _id: string;
    @observable
    name: string;
    @observable
    code: string;
    @observable
    status: number;
    @observable
    authority: string;
    @observable
    authorityList: AuthorityDetailFieldModel[];
}
export class RoleDetailModel extends Model<RoleDetailFieldModel>{
    codeExistsErr: string;
    constructor() {
        super(new RoleDetailFieldModel(), {
            validConfig: {
                name: {
                    validator: [required]
                },

                code: {
                    validator: [required, (val, model: RoleDetailModel) => {
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
            status: myEnum.roleStatus.启用,
            authorityList: []
        };
        ['_id', 'name', 'code', 'status', 'authorityList'].forEach(key => {
            let value = defaultVal.hasOwnProperty(key) ? defaultVal[key] : '';
            if (detail && detail.hasOwnProperty(key))
                value = detail[key];
            this.field[key] = value;
        });
    }
}