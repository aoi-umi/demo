import {
    getModelForClass, ModelType, DocType, InstanceType,
    setSchema, prop, arrayProp, getSchema
} from 'mongoose-ts-ua';
import { Types, SchemaTypes } from 'mongoose';
import { Base } from '../_base';

export type ChatInstanceType = InstanceType<Chat>;
export type ChatModelType = ModelType<Chat, typeof Chat>;
export type ChatDocType = DocType<ChatInstanceType>;
@setSchema()
export class Chat extends Base {
    @prop({
        required: true,
        type: SchemaTypes.ObjectId,
    })
    userId: Types.ObjectId;

    @prop({
        required: true,
        type: SchemaTypes.ObjectId,
    })
    destUserId: Types.ObjectId;

    @prop({
        required: true,
    })
    content: string;
}

export const ChatModel = getModelForClass<Chat, typeof Chat>(Chat);

