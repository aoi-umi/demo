import {
    getModelForClass, ModelType, DocType, InstanceType,
    setSchema, prop, arrayProp
} from 'mongoose-ts-ua';
import { Types, SchemaTypes } from 'mongoose';

import { Base } from '../_base';
import { myEnum } from '../../../config';
import { FileMapper } from '../file';

export type ArticleLogInstanceType = InstanceType<ArticleLog>;
export type ArticleLogModelType = ModelType<ArticleLog, typeof ArticleLog>;
export type ArticleLogDocType = DocType<ArticleLogInstanceType>;
@setSchema({
    schemaOptions: {
        toJSON: {
            virtuals: true
        }
    }
})
export class ArticleLog extends Base {
    @prop({
        type: SchemaTypes.ObjectId,
        required: true,
    })
    userId: Types.ObjectId;

    @prop()
    user: string;

    @prop({
        type: SchemaTypes.ObjectId,
        required: true,
    })
    articleId: Types.ObjectId;

    @prop({
        enum: myEnum.articleStatus.getAllValue(),
        required: true,
    })
    srcStatus: number;

    @prop({
        enum: myEnum.articleStatus.getAllValue(),
        required: true,
    })
    destStatus: number;

    @prop()
    remark: string;
}

export const ArticleLogModel = getModelForClass<ArticleLog, typeof ArticleLog>(ArticleLog);

