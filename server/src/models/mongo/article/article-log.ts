import {
    getModelForClass, ModelType, DocType, InstanceType,
    setSchema, prop, arrayProp
} from 'mongoose-ts-ua';
import { Types, SchemaTypes } from 'mongoose';

import { myEnum } from '@/config';
import { Base } from '../_base';

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
    logUser: string;

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

    @prop()
    get srcStatusText() {
        return myEnum.articleStatus.getKey(this.srcStatus);
    }

    @prop({
        enum: myEnum.articleStatus.getAllValue(),
        required: true,
    })
    destStatus: number;

    @prop()
    get destStatusText() {
        return myEnum.articleStatus.getKey(this.destStatus);
    }

    @prop()
    remark: string;
}

export const ArticleLogModel = getModelForClass<ArticleLog, typeof ArticleLog>(ArticleLog);

