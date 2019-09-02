import { RequestHandler } from 'express';

import { transaction } from '../_system/dbMongo';
import { error, escapeRegExp } from '../_system/common';
import * as config from '../config';
import { myEnum } from '../config';
import { responseHandler, paramsValid } from '../helpers';
import * as VaildSchema from '../vaild-schema/class-valid';
import { FollowMapper, FollowModel } from '../models/mongo/follow';
import { UserModel, UserMapper } from '../models/mongo/user';
import { BaseMapper } from '../models/mongo/_base';
import { FileMapper } from '../models/mongo/file';

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
        let cond: any = {
            status: myEnum.followStatus.已关注
        };
        let userId = data.userId;
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
        let userMatch;
        if (data.anyKey) {
            let anyKey = new RegExp(escapeRegExp(data.anyKey), 'i');
            userMatch = {
                $or: [
                    { account: anyKey },
                    { nickname: anyKey },
                    { profile: anyKey },
                ]
            };
        }

        let pipeline: any[] = [
            { $match: cond },
            ...UserMapper.lookupPipeline({
                userIdKey,
                match: userMatch,
                project: {
                    profile: 1
                }
            }),
        ];
        if (user.equalsId(data.userId)) {
            pipeline = [
                ...pipeline,
                //获取相互关注状态
                {
                    $lookup: {
                        from: FollowModel.collection.collectionName,
                        let: { followUserId: '$followUserId', userId: '$userId' },
                        pipeline: [{
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$$followUserId', '$userId'] },
                                        { $eq: ['$$userId', '$followUserId'] }
                                    ]

                                }
                            }
                        }],
                        as: 'follow'
                    }
                },
                { $unwind: { path: '$follow', preserveNullAndEmptyArrays: true } },
            ];
        }
        let rs = await FollowModel.aggregatePaginate(pipeline, {
            ...BaseMapper.getListOptions(data),
        });
        let opt = {
            imgHost: req.headers.host
        };
        let rows = rs.rows.map(detail => {
            detail.user.avatarUrl = FileMapper.getImgUrl(detail.user.avatar, opt.imgHost);
            detail[asName] = detail.user;
            let eachFollowStatus = detail.follow ? detail.follow.status : myEnum.followStatus.未关注;
            detail.user.followEachOther = eachFollowStatus === myEnum.followStatus.已关注;
            if (data.type == myEnum.followQueryType.关注) {
                detail.user.followStatus = detail.status;
            } else {
                detail.user.followStatus = eachFollowStatus;
            }
            UserMapper.resetDetail(detail.user, {
                imgHost: opt.imgHost
            });
            delete detail.user;
            delete detail.follow;
            return detail;
        });
        return {
            rows,
            total: rs.total
        };
    }, req, res);
};