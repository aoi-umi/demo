import { Types } from 'mongoose';
import * as VaildSchema from '../../../vaild-schema/class-valid';
import { Auth } from '../../../_system/auth';
import * as config from '../../../config';
import { myEnum } from '../../../config';
import { LoginUser } from '../../login-user';
import { BaseMapper, ContentBaseInstanceType } from '../_base';
import { ArticleMapper } from '../article';
import { UserModel, UserMapper } from '../user';
import { FileMapper } from '../file';
import { CommentModel, CommentDocType } from './comment';
import { VoteModel, VoteMapper } from '../vote';
import { FollowMapper } from '../follow';

type CommentResetOption = {
    imgHost?: string;
    user?: LoginUser
    authorId?: Types.ObjectId;
};
export class CommentMapper {
    static async create(data: VaildSchema.CommentSubmit, type, user: LoginUser) {
        let lastComment = await CommentModel.findOne({ ownerId: data.ownerId }).sort({ floor: -1 });
        let comment = new CommentModel({
            userId: user._id,
            ownerId: data.ownerId,
            comment: data.comment,
            quoteId: data.quoteId,
            topId: data.topId,
            type: type,
            floor: lastComment ? lastComment.floor + 1 : 1
        });
        return comment;
    }

    static async query(data: Partial<VaildSchema.CommentQuery>, opt: {
        resetOpt?: CommentResetOption,
        replyTopId?: any
    }) {
        let match: any;
        if (opt.replyTopId) {
            let topId = opt.replyTopId instanceof Array ? { $in: opt.replyTopId.map(ele => Types.ObjectId(ele)) } : Types.ObjectId(opt.replyTopId);
            match = { topId: topId };
            data.orderBy = '_id';
            data.sortOrder = 1;
        } else {
            match = {
                ownerId: data.ownerId,
                type: data.type,
                topId: data.topId || { $exists: 0 }
            }
        }

        // let owner = await CommentMapper.findOwner({
        //     ownerId: data.ownerId,
        //     type: data.type,
        //     mgt: true,
        // });
        let pipeline: any[] = [
            {
                $match: match
            },
            ...UserMapper.lookupPipeline(),
        ];
        let resetOpt = { ...opt.resetOpt };
        let extraPipeline = [];
        if (resetOpt.user) {
            extraPipeline = [
                ...VoteMapper.lookupPipeline({
                    userId: resetOpt.user._id
                }),
                ...FollowMapper.lookupPipeline({
                    userId: resetOpt.user._id,
                })
            ];
        }

        let rs = await CommentModel.aggregatePaginate(pipeline, {
            ...BaseMapper.getListOptions({
                ...data,
            }),
            extraPipeline,
        });

        rs.rows = rs.rows.map(detail => {
            return this.resetDetail(detail, {
                ...resetOpt,
                // authorId: owner && owner.userId
            });
        });
        return rs;
    }

    static async findOwner(opt: {
        ownerId,
        type,
        mgt?: boolean
    }) {
        let owner: ContentBaseInstanceType;
        let match: any = { _id: opt.ownerId };
        if (opt.type == myEnum.commentType.文章) {
            if (!opt.mgt)
                match.status = myEnum.articleStatus.审核通过
            owner = await ArticleMapper.findOne(match);
        }
        return owner;
    }

    static resetDetail(detail, opt: CommentResetOption) {
        detail.voteValue = detail.vote ? detail.vote.value : myEnum.voteValue.无;
        delete detail.vote;
        if (detail.status !== myEnum.commentStatus.正常) {
            return {
                _id: detail._id,
                floor: detail.floor,
                topId: detail.topId,
                quoteId: detail.quoteId,
                createdAt: detail.createdAt,
                voteValue: detail.voteValue,
                like: detail.like,
                dislike: detail.dislike,
                isDel: true,
            };
        }
        let { user } = opt;
        if (user) {
            let rs = {
                canDel: detail.status !== myEnum.commentStatus.已删除
                    && (detail.userId == user._id
                        || Auth.contains(user, config.auth.commentMgtDel)
                        // || (opt.authorId && opt.authorId.equals(user._id))
                    ),
            };
            detail.canDel = rs.canDel;
        }
        if (detail.user) {
            detail.user.avatarUrl = FileMapper.getImgUrl(detail.user.avatar, opt.imgHost);
            detail.user.followStatus = detail.follow ? detail.follow.status : myEnum.followStatus.未关注;
        }
        delete detail.follow;
        return detail;
    }
}