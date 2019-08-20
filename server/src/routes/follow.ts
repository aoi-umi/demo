import { RequestHandler } from 'express';
import { plainToClass } from 'class-transformer';
import { Types } from 'mongoose';

import { transaction } from '../_system/dbMongo';
import { error } from '../_system/common';
import * as config from '../config';
import { myEnum } from '../config';
import { responseHandler, paramsValid } from '../helpers';
import * as VaildSchema from '../vaild-schema/class-valid';
import { FollowMapper, FollowModel } from '../models/mongo/follow';
import { UserModel, UserMapper } from '../models/mongo/user';
import { BaseMapper } from '../models/mongo/_base';

export let save: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let user = req.myData.user;
        let data = plainToClass(VaildSchema.FollowSave, req.body);
        paramsValid(data);
        if (data.userId.equals(user._id)) {
            throw error('不能关注自己');
        }
        let detail = await FollowMapper.create({ userId: user._id, followUserId: data.userId });
        if (detail.status !== data.status) {
            let self = await UserModel.findById(user._id);
            let follow = await UserModel.findById(data.userId);
            let isFollowing = detail.status === myEnum.followStatus.已关注;
            let change = isFollowing ? -1 : 1;
            detail.status = data.status;
            await transaction(async (session) => {
                await detail.save({ session });
                await self.update({ following: self.following + change }, { session });
                await follow.update({ follower: follow.follower + change }, { session });
            });
        }

        return {
            status: data.status,
        };
    }, req, res);
};

export let query: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let user = req.myData.user;
        let data = plainToClass(VaildSchema.FollowQuery, req.query);
        paramsValid(data);
        let cond: any = {
            status: myEnum.followStatus.已关注
        };
        let userId = Types.ObjectId(user._id);
        let userIdKey = '';
        let asName = '';
        if (data.type == myEnum.followQueryType.关注) {
            cond.userId = userId
            userIdKey = 'followUserId';
            asName = 'followingUser';
        } else {
            cond.followUserId = userId;
            userIdKey = 'userId';
            asName = 'followerUser';
        }
        let rs = await FollowModel.aggregatePaginate([
            { $match: cond },
            ...UserMapper.lookupPipeline({
                userIdKey,
                asName,
                project: {
                    profile: 1
                }
            }),
        ], {
                ...BaseMapper.getListOptions(data),
            });
        return {
            rows: rs.rows,
            total: rs.total
        };
    }, req, res);
};