import { Types } from 'mongoose';
import { plainToClass, Type } from 'class-transformer';
import { GridFSModel } from '../../../_system/dbMongo';

export class FileMetaType {
    nickname: string;

    account: string;

    @Type(() => Types.ObjectId)
    userId: Types.ObjectId | string;

    fileType: string;
}

export class File extends GridFSModel<FileMetaType> {
    fileId: Types.ObjectId;
    buffer: Buffer;
    noModified: boolean;
    @Type()
    metadata: FileMetaType;

    static create(data: Partial<File>) {
        return plainToClass(File, {
            ...data,
            fileId: data.fileId || new Types.ObjectId()
        });
    }

    toObject() {
        return {
            filename: this.filename,
            fileId: this.fileId.toString(),
            md5: this.md5,
        }
    }
}

