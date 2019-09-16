import {
    getModelForClass, ModelType, DocType, InstanceType,
    setSchema, prop, arrayProp
} from 'mongoose-ts-ua';

import { myEnum } from '@/config';

import { Base } from '../_base';

export type AuthorityInstanceType = InstanceType<Authority>;
export type AuthorityModelType = ModelType<Authority, typeof Authority>;
export type AuthorityDocType = DocType<AuthorityInstanceType>;
@setSchema({
    schemaOptions: {
        toJSON: {
            virtuals: true
        }
    }
})
export class Authority extends Base {
    @prop({
        required: true,
        trim: true,
    })
    name: string;

    @prop({
        required: true,
        trim: true,
        index: {
            unique: true
        }
    })
    code: string;

    @prop({
        enum: myEnum.authorityStatus.getAllValue(),
        default: myEnum.authorityStatus.启用,
    })
    status: number;

    @prop()
    get statusText() {
        return myEnum.authorityStatus.getKey(this.status);
    }
}

export const AuthorityModel = getModelForClass<Authority, typeof Authority>(Authority);

