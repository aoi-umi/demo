import {
    getModelForClass, ModelType, DocType, InstanceType,
    setSchema, prop, arrayProp, setMethod
} from 'mongoose-ts-ua';
import moment = require('moment');
import { myEnum, dev } from '../../../config';
import { Base } from '../_base';

export type UserInstanceType = InstanceType<User>;
export type UserModelType = ModelType<User, typeof User>;
export type UserDocType = DocType<UserInstanceType>;
@setSchema({
    schemaOptions: {
        toJSON: {
            virtuals: true
        }
    }
})
export class User extends Base {
    @prop({
        required: true,
        index: {
            unique: true
        }
    })
    account: string;

    @prop({
        required: true
    })
    nickname: string;

    @prop({
        required: true
    })
    password: string;

    @arrayProp({
        type: String,
    })
    authorityList: string[];

    @arrayProp({
        type: String,
    })
    roleList: string[];

    @prop({
        enum: myEnum.userStatus.getAllValue(),
        default: myEnum.userStatus.正常,
    })
    status: number;

    //禁用时间
    @prop()
    disabledTo: Date;

    @setMethod
    checkDisabled() {
        let text = '';
        if (this.status === myEnum.userStatus.禁用) {
            text = '永久封禁';
        } else if (this.disabledTo && this.disabledTo > new Date()) {
            text = `封禁至 ${moment(this.disabledTo).format(dev.dateFormat)}`;
        }
        return {
            disabled: !!text,
            text,
        };
    }

    @prop()
    get canEdit() {
        return !this.roleList.includes(dev.rootRole);
    }

    @prop()
    get statusText() {
        let rs = this.checkDisabled();
        return rs.disabled ? rs.text : myEnum.userStatus.getKey(this.status);
    }
}

export const UserModel = getModelForClass<User, typeof User>(User);

