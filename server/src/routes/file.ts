import { RequestHandler, Request, Response } from "express";
import { Types } from 'mongoose';

import { responseHandler, paramsValid } from "../helpers";
import { myEnum } from "../config";
import { FileMapper, FileModel } from "../models/mongo/file";
import * as VaildSchema from '../vaild-schema/class-valid';

const uplaod = (option: { fileType: string }, req: Request, res: Response) => {
    responseHandler(async () => {
        let file = req.file;
        let user = req.myData.user;

        let fs = new FileModel({
            filename: file.originalname,
            userId: user._id,
            nickname: user.nickname,
            account: user.nickname,
            fileType: option.fileType
        });
        await fs.upload({
            buffer: file.buffer,
            contentType: file.mimetype,
        });
        let obj = fs.toOutObject();
        if (option.fileType == myEnum.fileType.图片) {
            obj.url = FileMapper.getImgUrl(fs.fileId, req.headers.host);
        }
        return obj;
    }, req, res);
};

export const imgUpload: RequestHandler = (req, res) => {
    uplaod({ fileType: myEnum.fileType.图片 }, req, res);
};

export const download = async (option: { fileType: string }, req: Request, res: Response) => {
    responseHandler(async (opt) => {
        let data = paramsValid(req.query, VaildSchema.FileGet);
        let ifModifiedSince = req.headers['if-modified-since'] as string;
        let detail = await FileModel.findOne({ _id: data._id, fileType: option.fileType });
        opt.noSend = true;
        if (!detail) {
            res.status(404);
            res.end();
            return;
        }
        let rs = await detail.download({
            ifModifiedSince,
            returnStream: true,
        });
        if (rs.noModified) {
            res.status(304)
            res.end();
        } else {
            res.set('Content-Type', rs.raw.contentType);
            res.set('Content-Length', rs.raw.length.toString());
            res.set('Content-Disposition', 'inline');
            res.set('Last-Modified', (rs.raw.uploadDate || new Date()).toUTCString());
            rs.stream.pipe(res);
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
        let file = await FileModel.rawFindOne({ _id: Types.ObjectId(data._id) });

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

        let { stream } = await new FileModel({ fileId: file._id }).download({ returnStream: true, streamOpt: { start, end } });
        stream.on('error', function (err) {
            res.end(err);
        });
        stream.pipe(res);
    }, req, res);
};