import {
    getModelForClass, ModelType, DocType, InstanceType,
    setSchema, prop, arrayProp
} from 'mongoose-ts-ua';
import { Base } from './base';
import { Types, SchemaTypes } from 'mongoose';
import { IVoteOwner } from '../vote';

export type ContentBaseInstanceType = InstanceType<ContentBase>;
export type ContentBaseDocType = DocType<ContentBaseInstanceType>;

@setSchema()
export class ContentBase extends Base implements IVoteOwner {
    @prop({
        type: SchemaTypes.ObjectId,
        required: true,
    })
    userId: Types.ObjectId;

    @prop({
        default: ''
    })
    profile: string;

    @prop()
    cover: string;

    @prop({
        required: true,
    })
    title: string;

    @arrayProp({
        type: String
    })
    cate: string[];

    @prop({
        default: 0
    })
    readTimes: number;

    @prop({
        default: 0
    })
    commentCount: number;

    @prop({
        default: 0
    })
    like: number;

    @prop({
        default: 0
    })
    dislike: number;

    @prop({
        default: ''
    })
    remark: string;
}