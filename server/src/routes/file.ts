import { RequestHandler, Request, Response } from "express";
import { plainToClass } from "class-transformer";
import { responseHandler, paramsValid } from "../helpers";
import { FileMapper, File } from "../models/mongo/file";
import { myEnum } from "../config";
import * as config from "../config";
import * as VaildSchema from '../vaild-schema/class-valid';
import { error } from "../_system/common";

const uplaod = (option: { fileType: string }, req: Request, res: Response) => {
    responseHandler(async () => {
        let file = req.file;

        let user = req.myData.user;

        let imgFile = File.create({
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

        await FileMapper.upload(imgFile);

        return imgFile.toObject();
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
        let myFile = await FileMapper.findById(data._id, ifModifiedSince);
        if (!myFile) {
            throw error('', config.error.NOT_FOUND);
        }
        opt.noSend = true;
        if (myFile.noModified) {
            res.statusCode = 304
            res.end();
        }
        else {
            res.set('Content-Type', myFile.contentType);
            res.set('Content-Length', myFile.buffer.length.toString());
            res.set('Content-Disposition', 'inline');
            res.set('Last-Modified', myFile.uploadDate ? myFile.uploadDate.toString() : new Date().toString());
            res.end(myFile.buffer);
        }
    }, req, res);
};

export const imgGet: RequestHandler = (req, res) => {
    download({ fileType: myEnum.fileType.图片 }, req, res);
};