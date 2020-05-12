import { RequestHandler, Request, Response } from "express";
import { GridFSInstance } from "mongoose-ts-ua";
import * as multer from '@koa/multer';

import * as common from "@/_system/common";
import { paramsValid } from "@/helpers";
import { myEnum } from "@/config";
import * as ValidSchema from '@/valid-schema/class-valid';
import { FileMapper, FileModel } from "@/models/mongo/file";
import { logger } from "@/helpers";
import { MyRequestHandler } from "@/middleware";

const uplaod: MyRequestHandler = async (opt) => {
    let option = <{ fileType: string, file: multer.File }>opt.reqOption;
    let { myData } = opt;
    let { file } = option;

    let rs = await FileMapper.upload({
        user: myData.user,
        fileType: option.fileType,
        contentType: file.mimetype,
        buffer: file.buffer,
        filename: file.originalname,
        imgHost: myData.imgHost
    });
    return rs;
};

const download: MyRequestHandler = async (opt, ctx) => {
    let option = <{ fileType: string }>opt.reqOption;

    let data = paramsValid(opt.reqData, ValidSchema.FileGet);
    let rawFile: GridFSInstance<any>;
    if (data.isRaw) {
        rawFile = await FileModel.rawFindOne({ _id: data._id });
    } else {
        let fileList = await FileMapper.findWithRaw({ _id: data._id, fileType: option.fileType });
        rawFile = fileList[0]?.rawFile;
    }
    opt.noSend = true;
    if (!rawFile) {
        ctx.status = 404;
        return;
    }
    //分片下载
    let range = ctx.headers.range as string;
    let downloadOpt: any = {
        returnStream: true,
    };
    if (range) {
        let pos = range.replace(/bytes=/, "").split("-");

        let total = rawFile.length;
        let start = parseInt(pos[0], 10);
        let end = pos[1] ? parseInt(pos[1], 10) : total - 1;
        let chunksize = (end - start) + 1;

        ctx.writeHead(206, {
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
            .pipe(ctx.res, { end: true })
            .on('error', function (err) {
                logger.log('file stream error:', err.message);
                ctx.sendStatus(500);
            });
    } else {
        let ifModifiedSince = ctx.request.get('if-modified-since');
        downloadOpt.ifModifiedSince = ifModifiedSince;
        let rs = await new FileModel({ fileId: rawFile._id }).download(downloadOpt);
        if (rs.noModified) {
            ctx.status = 304;
            return;
        }
        ctx.set('Content-Type', rs.raw.contentType);
        ctx.set('Content-Length', rs.raw.length.toString());
        ctx.set('Content-Disposition', 'inline');
        ctx.set('Last-Modified', (rs.raw.uploadDate || new Date()).toUTCString());
        // rs.stream.pipe(ctx.res);
        ctx.body = rs.stream;
    }
};

export const imgUpload: MyRequestHandler = (opt, ctx) => {
    opt.reqOption = { fileType: myEnum.fileType.图片, file: ctx.file };
    return uplaod(opt);
};

export const imgGet: MyRequestHandler = (opt, ctx) => {
    opt.reqOption = { fileType: myEnum.fileType.图片, file: ctx.file };
    return download(opt, ctx);
};

export const videoUpload: MyRequestHandler = (opt, ctx) => {
    opt.reqOption = { fileType: myEnum.fileType.视频, file: ctx.file };
    return uplaod(opt);
};

export const vedioGet: MyRequestHandler = (opt, ctx) => {
    opt.reqOption = { fileType: myEnum.fileType.视频, file: ctx.file };
    return download(opt, ctx);
};