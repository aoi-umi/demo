import { RequestHandler, Request, Response } from "express";
import { plainToClass } from "class-transformer";
import { Types } from 'mongoose';

import { responseHandler, paramsValid } from "../helpers";
import { myEnum } from "../config";
import { FileMapper, File } from "../models/mongo/file";
import * as VaildSchema from '../vaild-schema/class-valid';
import { gfs } from "../_system/dbMongo";

const uplaod = (option: { fileType: string }, req: Request, res: Response) => {
    responseHandler(async () => {
        let file = req.file;

        let user = req.myData.user;

        let uFile = File.create({
            filename: file.originalname,
            metadata: {
                userId: user._id,
                nickname: user.nickname,
                account: user.nickname,
                fileType: option.fileType
            },
            buffer: file.buffer,
            contentType: file.mimetype,
        });

        await FileMapper.upload(uFile);
        let obj = uFile.toObject();
        if (option.fileType == myEnum.fileType.图片) {
            obj.url = FileMapper.getImgUrl(uFile.fileId, req.headers.host);
        }
        return obj;
    }, req, res);
};

export const imgUpload: RequestHandler = (req, res) => {
    uplaod({ fileType: myEnum.fileType.图片 }, req, res);
};

export const download = async (option: { fileType: string }, req: Request, res: Response) => {
    responseHandler(async (opt) => {
        let data = plainToClass(VaildSchema.FileGet, req.query);
        paramsValid(data);
        let ifModifiedSince = req.headers['if-modified-since'] as string;
        let myFile = await FileMapper.findOne({ _id: data._id, 'metadata.fileType': option.fileType }, ifModifiedSince);
        opt.noSend = true;
        if (!myFile) {
            res.statusCode = 404;
            res.end();
        } else if (myFile.noModified) {
            res.statusCode = 304
            res.end();
        }
        else {
            res.set('Content-Type', myFile.contentType);
            res.set('Content-Length', myFile.buffer.length.toString());
            res.set('Content-Disposition', 'inline');
            res.set('Last-Modified', (myFile.uploadDate || new Date()).toUTCString());
            res.end(myFile.buffer);
        }
    }, req, res);
};

export const imgGet: RequestHandler = (req, res) => {
    download({ fileType: myEnum.fileType.图片 }, req, res);
};

export const vedioGet: RequestHandler = (req, res) => {
    responseHandler(async (opt) => {
        let data = req.query;

        let range = req.headers.range as string;
        let pos = range.replace(/bytes=/, "").split("-");
        data._id = '5d521fca691ea819d8db4ea7';
        opt.noSend = true;
        let file = await gfs.findOne({ _id: Types.ObjectId(data._id) });

        let total = file.length;
        let start = parseInt(pos[0], 10);
        let end = pos[1] ? parseInt(pos[1], 10) : total - 1;
        let chunksize = (end - start) + 1;

        res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${total}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4'
        });

        let stream = gfs.gridFS.openDownloadStream(file._id, { start, end })
            .on('error', function (err) {
                res.end(err);
            });
        stream.pipe(res);
    }, req, res);
};