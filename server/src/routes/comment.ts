import { RequestHandler } from 'express';
import { plainToClass } from 'class-transformer';

import { responseHandler, paramsValid } from '../helpers';
import { transaction } from '../_system/dbMongo';
import * as VaildSchema from '../vaild-schema/class-valid';
import { CommentMapper } from '../models/mongo/comment';

export let submit: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let user = req.myData.user;
        let data = plainToClass(VaildSchema.CommentSubmit, req.body);
        paramsValid(data);
        let owner = await CommentMapper.findOwner(data.ownerId, data.type);
        let comment = await CommentMapper.create(data, data.type, user);
        comment.ip = req.realIp;
        await transaction(async (session) => {
            await comment.save({ session });
            await owner.update({ commentCount: owner.commentCount + 1 });
        });
        return {
            ...comment.toJSON(),
            user: {
                account: user.account,
                nickname: user.nickname,
                avatar: user.avatar,
                avatarUrl: user.avatarUrl,
            }
        };
    }, req, res);
};

export let query: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let user = req.myData.user;
        let data = plainToClass(VaildSchema.CommentQuery, req.query);
        paramsValid(data);
        let { total, rows } = await CommentMapper.query({
            ...data,
        }, {
                resetOpt: {
                    imgHost: req.headers.host
                }
            });
        return {
            rows,
            total,
        };
    }, req, res);
};