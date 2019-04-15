import {
    getModelForClass, ModelType, DocType, InstanceType,
    setSchema, prop, arrayProp
} from 'mongoose-ts-ua';
import { Base } from '../_base';

export type UserInstanceType = InstanceType<User>;
export type UserModelType = ModelType<User, typeof User>;
export type UserDocType = DocType<UserInstanceType>;
@setSchema({
    schemaOptions: {}
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
}

export const UserModel = getModelForClass<User, typeof User>(User);

