import { RequestHandler } from 'express';

import { paramsValid } from '@/helpers';
import { myEnum } from '@/config';
import * as config from '@/config';
import { Auth } from '@/_system/auth';
import * as ValidSchema from '@/valid-schema/class-valid';
import { mySocket } from '@/main';
import { MyRequestHandler } from '@/middleware';

import { DanmakuModel } from '@/models/mongo/danmaku';

export let submit: MyRequestHandler = async (opt, req, res) => {
    let user = req.myData.user;
    let data = paramsValid(req.body, ValidSchema.DanmakuSubmit);
    let detail = new DanmakuModel({
        ...data,
        userId: user._id,
    });
    await detail.save();

    mySocket.socketUser.danmakuBoardcast(detail.videoId, detail);
};

export let query: MyRequestHandler = async (opt, req, res) => {
    let user = req.myData.user;
    let data = paramsValid(req.query, ValidSchema.DanmakuQuery);
    let rows = await DanmakuModel.find({ videoId: data.videoId });
    return {
        rows
    };
};