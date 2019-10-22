import { RequestHandler } from "express";

import { responseHandler, paramsValid } from "@/helpers";
import { error } from "@/_system/common";
import { mySocket } from "@/_main";
import * as VaildSchema from '@/vaild-schema/class-valid';

import { ChatModel, ChatMapper } from "@/models/mongo/chat";
import { BaseMapper } from "@/models/mongo/_base";
import { UserMapper } from "@/models/mongo/user";

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
        let rs = await ChatMapper.query(data, { userId: user._id, imgHost: req.myData.imgHost });
        return {
            rows: rs.rows,
            total: rs.total,
        };
    }, req, res);
};

export let list: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let user = req.myData.user;
        let data = paramsValid(req.query, VaildSchema.ChatList);
        let userId = user._id;
        let rs = await ChatModel.aggregatePaginate([
            {
                $match: {
                    $or: [{ "destUserId": userId }, { "userId": userId }]
                }
            },
            {
                $project: {
                    key1: { $cond: [{ $eq: ['$userId', userId] }, '$userId', '$destUserId'] },
                    key2: { $cond: [{ $ne: ['$userId', userId] }, '$userId', '$destUserId'] },
                    data: '$$ROOT',
                }
            },
            { $group: { _id: { key1: '$key1', key2: '$key2' }, data: { $last: '$data' } } }
        ], {
                ...BaseMapper.getListOptions(data),
                extraPipeline: [
                    //key2为对方id
                    ...UserMapper.lookupPipeline({
                        userIdKey: '_id.key2'
                    })
                ]
            });
        let rows = rs.rows.map(ele => {
            let obj = ele.data;
            UserMapper.resetDetail(ele.user, { imgHost: req.myData.imgHost });
            obj.user = ele.user;
            return obj;
        });
        return {
            rows,
            total: rs.total,
        };
    }, req, res);
};