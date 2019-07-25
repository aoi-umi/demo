import { Types } from 'mongoose';

import { gfs, GridFSInstance } from '../../../_system/dbMongo';
import { FileMetaType, File } from './file';

export class FileMapper {
    static async  upload(file: File) {
        let rs = await gfs.upload({
            _id: file.fileId,
            filename: file.filename,
            buffer: file.buffer,
            contentType: file.contentType,
            metadata: file.metadata
        });
        return rs;
    }

    static async findById(fileId: Types.ObjectId | string, ifModifiedSince?: string | Date) {
        fileId = new Types.ObjectId(fileId);
        let buf: Buffer, noModified = false;
        let dbFile: Partial<GridFSInstance<FileMetaType>>;

        function isNoModified(uploadDate: Date) {
            return ifModifiedSince
                && parseInt(new Date(ifModifiedSince).getTime() / 1000 as any) == parseInt(uploadDate.getTime() / 1000 as any)
        }
        dbFile = await gfs.findOne({ _id: fileId });
        if (dbFile) {
            noModified = isNoModified(dbFile.uploadDate);
            if (!noModified)
                buf = await gfs.readFile({ _id: dbFile._id });
        }

        if (!dbFile)
            return null;

        let file = File.create({
            ...dbFile,
            buffer: buf,
            fileId: fileId,
            noModified,
        });
        return file;
    }
}