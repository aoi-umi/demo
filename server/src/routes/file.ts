import { RequestHandler, Request, Response } from "express";
import { GridFSInstance } from "mongoose-ts-ua";

import * as common from "@/_system/common";
import { paramsValid } from "@/helpers";
import { myEnum } from "@/config";
import * as ValidSchema from '@/valid-schema/class-valid';
import { FileMapper, FileModel } from "@/models/mongo/file";
import { logger } from "@/helpers";
import { MyRequestHandler } from "@/middleware";

const uplaod: MyRequestHandler = async (opt, req: Request, res: Response) => {
    let option = <{ fileType: string }>req.myOption;
    let file = req.file;
    let user = req.myData.user;

    let rs = await FileMapper.upload({
        user,
        fileType: option.fileType,
        contentType: file.mimetype,
        buffer: file.buffer,
        filename: file.originalname,
        imgHost: req.myData.imgHost
    });
    return rs;
};

const download: MyRequestHandler = async (opt, req: Request, res: Response) => {
    let option = <{ fileType: string }>req.myOption;

    let data = paramsValid(req.query, ValidSchema.FileGet);
    let rawFile: GridFSInstance<any>;
    if (data.isRaw) {
        rawFile = await FileModel.rawFindOne({ _id: data._id });
    } else {
        let fileList = await FileMapper.findWithRaw({ _id: data._id, fileType: option.fileType });
        rawFile = fileList[0]?.rawFile;
    }
    opt.noSend = true;
    if (!rawFile) {
        res.status(404).end();
        return;
    }
    //分片下载
    let range = req.headers.range as string;
    let downloadOpt: any = {
        returnStream: true,
    };
    if (range) {
        let pos = range.replace(/bytes=/, "").split("-");

        let total = rawFile.length;
        let start = parseInt(pos[0], 10);
        let end = pos[1] ? parseInt(pos[1], 10) : total - 1;
        let chunksize = (end - start) + 1;

        res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${total}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': rawFile.contentType,
        });
        downloadOpt.streamOpt = {
            start,
            end: end + 1
            //不加1会提示 ERR_CONTENT_LENGTH_MISMATCH
        };
        let rs = await new FileModel({ fileId: rawFile._id }).download(downloadOpt);
        rs.stream
            .pipe(res, { end: true })
            .on('error', function (err) {
                logger.log('file stream error:', err.message);
                res.sendStatus(500);
            });
    } else {
        let ifModifiedSince = req.headers['if-modified-since'] as string;
        downloadOpt.ifModifiedSince = ifModifiedSince;
        let rs = await new FileModel({ fileId: rawFile._id }).download(downloadOpt);
        if (rs.noModified) {
            res.status(304);
            res.end();
            return;
        }
        res.set('Content-Type', rs.raw.contentType);
        res.set('Content-Length', rs.raw.length.toString());
        res.set('Content-Disposition', 'inline');
        res.set('Last-Modified', (rs.raw.uploadDate || new Date()).toUTCString());
        rs.stream.pipe(res);
    }
};

export const imgUpload: MyRequestHandler = (opt, req, res) => {
    req.myOption = { fileType: myEnum.fileType.图片 };
    return uplaod(opt, req, res);
};

export const imgGet: MyRequestHandler = (opt, req, res) => {
    req.myOption = { fileType: myEnum.fileType.图片 };
    return download(opt, req, res);
};

export const videoUpload: MyRequestHandler = (opt, req, res) => {
    req.myOption = { fileType: myEnum.fileType.视频 };
    return uplaod(opt, req, res);
};

export const vedioGet: MyRequestHandler = (opt, req, res) => {
    req.myOption = { fileType: myEnum.fileType.视频 };
    return download(opt, req, res);
};