import {
    getModelForClass, ModelType, DocType, InstanceType,
    setSchema, prop, arrayProp
} from 'mongoose-ts-ua';

import { myEnum } from '@/config';
import { ContentBase } from '../content/content-base';

export type VideoInstanceType = InstanceType<Video>;
export type VideoModelType = ModelType<Video, typeof Video>;
export type VideoDocType = DocType<VideoInstanceType>;
@setSchema({
    schemaOptions: {
        toJSON: {
            virtuals: true
        }
    }
})
export class Video extends ContentBase {
    @prop({
        required: true,
    })
    content: string;

    @prop({
        enum: myEnum.videoStatus.getAllValue()
    })
    status: number;

    @prop()
    get statusText() {
        return myEnum.videoStatus.getKey(this.status);
    }

    @prop()
    get canUpdate() {
        return [myEnum.videoStatus.草稿, myEnum.videoStatus.审核不通过].includes(this.status);
    }
}

export const VideoModel = getModelForClass<Video, typeof Video>(Video);

