import { RequestHandler } from 'express';
import { plainToClass } from 'class-transformer';

import { transaction } from '../_system/dbMongo';
import { error } from '../_system/common';
import * as config from '../config';
import { myEnum } from '../config';
import { responseHandler, paramsValid } from '../helpers';
import * as VaildSchema from '../vaild-schema/class-valid';
import { FollowMapper } from '../models/mongo/follow';
import { UserModel } from '../models/mongo/user';

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