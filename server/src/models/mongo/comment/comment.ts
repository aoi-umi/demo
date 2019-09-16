import {
    getModelForClass, ModelType, DocType, InstanceType,
    setSchema, prop, arrayProp
} from 'mongoose-ts-ua';
import { Types, SchemaTypes } from 'mongoose';

import { myEnum } from '@/config';

import { Base } from '../_base';
import { IVoteOwner } from '../vote';

export type CommentInstanceType = InstanceType<Comment>;
export type CommentModelType = ModelType<Comment, typeof Comment>;
export type CommentDocType = DocType<CommentInstanceType>;
@setSchema()
export class Comment extends Base implements IVoteOwner {
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
        required: true,
        enum: myEnum.commentStatus.getAllValue(),
        default: myEnum.commentStatus.正常
    })
    status: number;

    @prop({
        type: SchemaTypes.ObjectId
    })
    topId: Types.ObjectId;

    @prop({
        type: SchemaTypes.ObjectId
    })
    quoteId: Types.ObjectId;

    @prop({
        type: SchemaTypes.ObjectId
    })
    quoteUserId: Types.ObjectId;

    @prop({
        required: true
    })
    floor: number;

    @prop()
    ip: string;

    @prop()
    comment: string;

    @prop({
        default: 0
    })
    like: number;

    @prop({
        default: 0
    })
    dislike: number;
}

export const CommentModel = getModelForClass<Comment, typeof Comment>(Comment);

