import { RequestHandler } from 'express';

import { transaction } from '@/_system/dbMongo';
import { error } from '@/_system/common';
import { myEnum } from '@/config';
import { responseHandler, paramsValid } from '@/helpers';
import * as VaildSchema from '@/vaild-schema/class-valid';
import { FollowMapper } from '@/models/mongo/follow';
import { UserModel, UserMapper } from '@/models/mongo/user';

export let save: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let user = req.myData.user;
        let data = paramsValid(req.body, VaildSchema.FollowSave);
        if (user.equalsId(data.userId)) {
            throw error('不能关注自己');
        }
        let detail = await FollowMapper.create({ userId: user._id, followUserId: data.userId });
        let { followEachOther } = await FollowMapper.isFollowEach({
            srcStatus: data.status,
            srcUserId: user._id,
            destUserId: data.userId
        });
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
            followEachOther,
        };
    }, req, res);
};

export let query: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let user = req.myData.user;
        let data = paramsValid(req.query, VaildSchema.FollowQuery);
        let { rows, total } = await FollowMapper.query(data, { user, imgHost: req.myData.imgHost });
        return {
            rows,
            total,
        };
    }, req, res);
};