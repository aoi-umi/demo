import {
    getModelForClass, ModelType, DocType, InstanceType,
    setSchema, prop, arrayProp, getSchema
} from 'mongoose-ts-ua';
import { Types, SchemaTypes } from 'mongoose';
import { Base } from '../_base';
import { myEnum } from '../../../config';

export type FollowInstanceType = InstanceType<Follow>;
export type FollowModelType = ModelType<Follow, typeof Follow>;
export type FollowDocType = DocType<FollowInstanceType>;

@setSchema()
export class Follow extends Base {
    @prop({
        type: SchemaTypes.ObjectId,
        required: true
    })
    userId: Types.ObjectId;

    @prop({
        type: SchemaTypes.ObjectId,
        required: true
    })
    followUserId: Types.ObjectId;

    @prop({
        required: true,
        enum: myEnum.followStatus.getAllValue()
    })
    status: number;
}

let schema = getSchema(Follow);
schema.index({ userId: 1, followUserId: 1 }, { unique: true });
export const FollowModel = getModelForClass<Follow, typeof Follow>(Follow);

