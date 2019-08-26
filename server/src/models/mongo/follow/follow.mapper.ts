import { Types } from "mongoose";

import { myEnum } from "../../../config";
import { FollowModel } from "./follow";

export class FollowMapper {
    static async create(opt: {
        userId,
        followUserId,
    }) {
        let follow = await FollowModel.findOne({ userId: opt.userId, followUserId: opt.followUserId });
        if (!follow) {
            follow = new FollowModel({
                userId: opt.userId,
                followUserId: opt.followUserId,
                status: myEnum.followStatus.未关注,
            });
        }
        return follow;
    }

    static lookupPipeline(opt: {
        userId: any;
        userIdKey?: string;
    }) {
        return [
            {
                $lookup: {
                    from: FollowModel.collection.collectionName,
                    let: { followUserId: '$' + (opt.userIdKey || 'userId') },
                    pipeline: [{
                        $match: {
                            userId: Types.ObjectId(opt.userId),
                            $expr: { $eq: ['$$followUserId', '$followUserId'] }
                        }
                    }],
                    as: 'follow'
                }
            },
            { $unwind: { path: '$follow', preserveNullAndEmptyArrays: true } },
        ];
    }

    static async isFollowEach(data: {
        srcStatus: number,
        srcUserId: any,
        destUserId: any
    }) {
        let destFollow = await FollowModel.findOne({ userId: data.destUserId, followUserId: data.srcUserId });
        let followEachOther = destFollow && destFollow.status === myEnum.followStatus.已关注 && data.srcStatus === myEnum.followStatus.已关注;
        return {
            destFollow,
            followEachOther
        };
    }
}