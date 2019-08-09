import {
    getModelForClass, ModelType, DocType, InstanceType,
    setSchema, prop, arrayProp
} from 'mongoose-ts-ua';
import { Types, SchemaTypes } from 'mongoose';

import { myEnum } from '../../../config';
import { Base } from '../_base';

export type CommentInstanceType = InstanceType<Comment>;
export type CommentModelType = ModelType<Comment, typeof Comment>;
export type CommentDocType = DocType<CommentInstanceType>;
@setSchema()
export class Comment extends Base {
    /**
     * 所属文章等id
     */
    @prop({
        required: true,
        type: SchemaTypes.ObjectId
    })
    ownerId: Types.ObjectId;

    @prop({
        required: true,
        type: SchemaTypes.ObjectId
    })
    userId: Types.ObjectId;

    @prop({
        required: true,
        enum: myEnum.commentType.getAllValue(),
    })
    type: number;

    @prop({
        type: SchemaTypes.ObjectId
    })
    quotId: Types.ObjectId;

    @prop({
        required: true
    })
    floor: number;

    @prop()
    comment: string;

    @prop({
        default: 0
    })
    vote: number;
}

export const CommentModel = getModelForClass<Comment, typeof Comment>(Comment);
