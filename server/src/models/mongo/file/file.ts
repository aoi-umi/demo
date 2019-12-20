import { Types, SchemaTypes } from 'mongoose';
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
            rawFileId: this.fileId.toString(),
            url: '',
        };
    }
}

export const FileModel = getGridFSModel<File, typeof File>({
    schema: File,
});