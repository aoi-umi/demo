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
}