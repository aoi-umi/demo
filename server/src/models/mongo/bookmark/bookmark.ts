import {
    getModelForClass, ModelType, DocType, InstanceType,
    setSchema, prop, arrayProp
} from 'mongoose-ts-ua';
import { Base } from '../_base';

export type BookmarkInstanceType = InstanceType<Bookmark>;
export type BookmarkModelType = ModelType<Bookmark, typeof Bookmark>;
export type BookmarkDocType = DocType<BookmarkInstanceType>;
@setSchema({
    schemaOptions: {}
})
export class Bookmark extends Base {
    @prop()
    name: string;

    @prop()
    url: string;

    @arrayProp({
        type: String
    })
    tagList: string[];
}

export const BookmarkModel = getModelForClass<Bookmark, typeof Bookmark>(Bookmark);

