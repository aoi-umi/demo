import {
    getModelForClass, ModelType, DocType, InstanceType,
    setSchema, prop, arrayProp
} from 'mongoose-ts-ua';
import { Base } from '../_base';

export type BookmarkInstanceType = InstanceType<User>;
export type BookmarkModelType = ModelType<User, typeof User>;
export type BookmarkDocType = DocType<BookmarkInstanceType>;
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
}

export const UserModel = getModelForClass<User, typeof User>(User);

