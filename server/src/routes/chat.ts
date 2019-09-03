import { RequestHandler } from "express";
import { responseHandler, paramsValid } from "../helpers";
import * as VaildSchema from '../vaild-schema/class-valid';
import { ChatModel, ChatMapper } from "../models/mongo/chat";
import { error } from "../_system/common";
import { mySocket } from "../_main";

export let submit: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let user = req.myData.user;
        let data = paramsValid(req.body, VaildSchema.ChatSubmit);
        if (user.equalsId(data.destUserId))
            throw error('不能私信自己');
        let chat = new ChatModel({
            ...data,
            userId: user._id,
        });
        await chat.save();
        mySocket.socketUser.sendChat(chat.toObject())
    }, req, res);
};

export let query: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let user = req.myData.user;
        let data = paramsValid(req.query, VaildSchema.ChatQuery);
        let rs = await ChatMapper.query(data, { userId: user._id, imgHost: req.headers.host });
        return {
            rows: rs.rows,
            total: rs.total,
        };
    }, req, res);
};