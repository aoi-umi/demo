import {
    getModelForClass,
    ModelType,
    DocType,
    InstanceType,
    setSchema,
    prop,
    arrayProp,
    getSchema,
} from 'mongoose-ts-ua';
import { Types, SchemaTypes } from 'mongoose';

import { myEnum } from '@/config/enum';

import { Base } from '../_base';

export type ViewHistoryInstanceType = InstanceType<ViewHistory>;
export type ViewHistoryModelType = ModelType<ViewHistory, typeof ViewHistory>;
export type ViewHistoryDocType = DocType<ViewHistoryInstanceType>;
@setSchema()
export class ViewHistory extends Base {
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
        enum: myEnum.contentType.getAllValue(),
    })
    type: number;

    @prop()
    at: Date;
}

let schema = getSchema(ViewHistory);
schema.index({ ownerId: 1, userId: 1 }, { unique: true });

export const ViewHistoryModel = getModelForClass<ViewHistory, typeof ViewHistory>(ViewHistory);