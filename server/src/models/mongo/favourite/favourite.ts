import {
    getModelForClass, ModelType, DocType, InstanceType,
    setSchema, prop, arrayProp, getSchema, setPlugin
} from 'mongoose-ts-ua';
import { Types, SchemaTypes } from 'mongoose';

import { myEnum } from '@/config/enum';

import { Base } from '../_base';
import { pagination, IPagination } from '../_plugins/pagination';

export type FavouriteInstanceType = InstanceType<Favourite>;
export type FavouriteModelType = ModelType<Favourite, typeof Favourite>;
export type FavouriteDocType = DocType<FavouriteInstanceType>;
@setSchema()
@setPlugin(pagination)
export class Favourite extends Base {
    @prop({
        required: true,
        type: SchemaTypes.ObjectId,
    })
    userId: Types.ObjectId;

    @prop({
        required: true,
        type: SchemaTypes.ObjectId,
    })
    ownerId: Types.ObjectId;

    @prop({
        required: true,
        enum: myEnum.contentType.getAllValue()
    })
    type: number;

    @prop({
        required: true,
    })
    favourite: boolean;

    @prop()
    favourAt: Date;
}

let schema = getSchema(Favourite);
schema.index({ ownerId: 1, userId: 1 }, { unique: true });

export const FavouriteModel = getModelForClass<Favourite, typeof Favourite & IPagination<Favourite>>(Favourite);

export interface IFavouriteOwner {
    favourite: number;
}