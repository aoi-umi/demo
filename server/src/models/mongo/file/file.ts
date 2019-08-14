import { Types, SchemaTypes } from 'mongoose';
import { plainToClass, Type, Transform } from 'class-transformer';
import { GridFSFile, GridFSModel, setSchema, prop, setMethod, getGridFSModel } from 'mongoose-ts-ua';


@setSchema()
class File extends GridFSFile {
    @prop()
    nickname: string;

    @prop()
    account: string;

    @prop({
        type: SchemaTypes.ObjectId
    })
    userId: Types.ObjectId;

    @prop()
    fileType: string;

    @setMethod
    toOutObject() {
        return {
            filename: this.filename,
            fileId: this._id.toString(),
            url: '',
        };
    }
}

export const FileModel = getGridFSModel<File, typeof File>({
    schema: File,
});