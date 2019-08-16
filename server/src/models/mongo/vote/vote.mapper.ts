import { Model, InstanceType } from "mongoose-ts-ua";
import { myEnum } from "../../../config";
import { ArticleMapper, ArticleModel } from "../article";
import { CommentModel } from "../comment";
import { IVoteOwner, VoteModel } from "./vote";

export class VoteMapper {
    static async create(opt: {
        ownerId,
        userId,
        type,
    }) {
        let vote = await VoteModel.findOne({ ownerId: opt.ownerId, userId: opt.userId });
        if (!vote) {
            vote = new VoteModel({
                ownerId: opt.ownerId,
                userId: opt.userId,
                type: opt.type,
                value: myEnum.voteValue.无
            });
        }
        return vote;
    }

    static async findOwner(opt: {
        ownerId,
        type,
    }) {
        let owner: InstanceType<IVoteOwner>;
        if (opt.type == myEnum.voteType.文章) {
            owner = await ArticleModel.findOne({
                _id: opt.ownerId,
                status: myEnum.articleStatus.审核通过
            });
        } else if (opt.type == myEnum.voteType.评论) {
            owner = await CommentModel.findOne({
                _id: opt.ownerId,
                status: myEnum.commentStatus.正常
            });
        }
        return owner;
    }
}