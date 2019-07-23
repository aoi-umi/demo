import {
    getModelForClass, ModelType, DocType, InstanceType,
    setSchema, prop, arrayProp
} from 'mongoose-ts-ua';
import { Types, SchemaTypes } from 'mongoose';

import { Base } from '../_base';
import { myEnum } from '../../../config';

export type ArticleInstanceType = InstanceType<Article>;
export type ArticleModelType = ModelType<Article, typeof Article>;
export type ArticleDocType = DocType<ArticleInstanceType>;
@setSchema({
    schemaOptions: {
        toJSON: {
            virtuals: true
        }
    }
})
export class Article extends Base {
    @prop({
        type: SchemaTypes.ObjectId,
    })
    userId: Types.ObjectId;

    @prop()
    cover: string;

    @prop()
    title: string;

    @prop()
    content: string;

    @arrayProp({
        type: String
    })
    cate: string[];

    @prop({
        enum: myEnum.articleStatus
    })
    status: number;

    @prop()
    get canUpdate() {
        return [myEnum.articleStatus.草稿, myEnum.articleStatus.审核不通过].includes(this.status);
    }

    @prop()
    get statusText() {
        return myEnum.articleStatus.getKey(this.status);
    }
}

export const ArticleModel = getModelForClass<Article, typeof Article>(Article);

