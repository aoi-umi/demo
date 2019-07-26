import { Types } from 'mongoose';

import { gfs, GridFSInstance } from '../../../_system/dbMongo';
import * as config from '../../../config';
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

    static async findOne(cond: any, ifModifiedSince?: string | Date) {
        let buf: Buffer, noModified = false;
        let dbFile: Partial<GridFSInstance<FileMetaType>>;

        function isNoModified(uploadDate: Date) {
            return ifModifiedSince
                && parseInt(new Date(ifModifiedSince).getTime() / 1000 as any) == parseInt(uploadDate.getTime() / 1000 as any)
        }
        dbFile = await gfs.findOne(cond);
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
            fileId: dbFile._id,
            noModified,
        });
        return file;
    }

    static async findById(fileId: Types.ObjectId | string, ifModifiedSince?: string | Date) {
        fileId = new Types.ObjectId(fileId);
        return this.findOne({ _id: fileId }, ifModifiedSince);
    }

    static getImgUrl(_id, host?: string) {
        if (!_id)
            return '';
        if (host) {
            host = '//' + host;
        }
        return host + config.env.imgPrefix + '?_id=' + _id;
    }
}