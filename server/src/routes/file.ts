import { RequestHandler, Request, Response } from "express";
import { Types } from 'mongoose';

import * as common from "@/_system/common";
import { responseHandler, paramsValid } from "@/helpers";
import { myEnum } from "@/config";
import * as VaildSchema from '@/vaild-schema/class-valid';
import { FileMapper, FileModel } from "@/models/mongo/file";
import { logger } from "@/helpers";

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
        let fileType = file.mimetype.split('/')[0];
        if (
            (option.fileType === myEnum.fileType.视频 && fileType !== 'video')
            || option.fileType === myEnum.fileType.图片 && fileType !== 'image'
        )
            throw common.error('错误的文件类型');
        await fs.upload({
            buffer: file.buffer,
            contentType: file.mimetype,
        });
        let obj = fs.toOutObject();
        obj.url = FileMapper.getUrl(fs._id, option.fileType, req.myData.imgHost);
        return obj;
    }, req, res);
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

export const imgUpload: RequestHandler = (req, res) => {
    uplaod({ fileType: myEnum.fileType.图片 }, req, res);
};

export const imgGet: RequestHandler = (req, res) => {
    download({ fileType: myEnum.fileType.图片 }, req, res);
};

export const videoUpload: RequestHandler = (req, res) => {
    uplaod({ fileType: myEnum.fileType.视频 }, req, res);
};

export const vedioGet: RequestHandler = (req, res) => {
    responseHandler(async (opt) => {
        opt.noSend = true;
        let data = paramsValid(req.query, VaildSchema.FileGet);
        let fileList = await FileMapper.findWithRaw({ _id: data._id, fileType: myEnum.fileType.视频 });
        let rawFile = fileList[0] && fileList[0].rawFile;
        if (!rawFile) {
            res.status(404).end();
            return;
        }
        let range = req.headers.range as string;
        let pos = range ? range.replace(/bytes=/, "").split("-") : ['0'];

        let total = rawFile.length;
        let start = parseInt(pos[0], 10);
        let end = pos[1] ? parseInt(pos[1], 10) : total - 1;
        let chunksize = (end - start) + 1;

        res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${total}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4'
        });

        let { stream } = await new FileModel({ fileId: rawFile._id }).download({
            returnStream: true, streamOpt: {
                start,
                end: end + 1
                //不加1会提示 ERR_CONTENT_LENGTH_MISMATCH
            }
        });
        stream
            .pipe(res, { end: true })
            .on('error', function (err) {
                logger.log('file stream error:', err.message);
                res.sendStatus(500);
            });
    }, req, res);
};