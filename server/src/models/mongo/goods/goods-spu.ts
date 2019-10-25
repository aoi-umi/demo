import {
    getModelForClass, ModelType, DocType, InstanceType,
    setSchema, prop, arrayProp, getSchema
} from 'mongoose-ts-ua';
import { Types, SchemaTypes } from 'mongoose';

import { myEnum } from '@/config';

import { Base } from '../_base';
export type GoodsSpuInstanceType = InstanceType<GoodsSpu>;
export type GoodsSpuModelType = ModelType<GoodsSpu, typeof GoodsSpu>;
export type GoodsSpuDocType = DocType<GoodsSpuInstanceType>;

@setSchema({
    schemaOptions: {
        toJSON: { virtuals: true }
    }
})
export class GoodsSpu extends Base {
    @prop({
        required: true,
        type: SchemaTypes.ObjectId,
    })
    userId: Types.ObjectId;

    @prop({
        required: true,
    })
    name: string;

    @arrayProp({
        type: SchemaTypes.ObjectId
    })
    typeIds: Types.ObjectId[];

    @prop({
        required: true,
    })
    profile: string;

    @arrayProp({
        required: true,
        type: String,
        minlength: 1,
    })
    imgs: string[];

    @prop({
        required: true,
        enum: myEnum.goodsStatus.getAllValue(),
    })
    status: number;

    //上架时间
    @prop({
        required: true
    })
    putOnAt: Date;

    //失效时间
    @prop()
    expireAt: Date;
}

export const GoodsSpuModel = getModelForClass<GoodsSpu, typeof GoodsSpu>(GoodsSpu);