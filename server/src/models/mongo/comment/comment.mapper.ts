import { Types } from 'mongoose';
import * as VaildSchema from '../../../vaild-schema/class-valid';
import { Auth } from '../../../_system/auth';
import * as config from '../../../config';
import { myEnum } from '../../../config';
import { LoginUser } from '../../login-user';
import { BaseMapper, ContentBaseInstanceType } from '../_base';
import { ArticleMapper } from '../article';
import { UserModel } from '../user';
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
            quotId: data.quotId,
            type: type,
            floor: lastComment ? lastComment.floor + 1 : 1
        });
        return comment;
    }

    static async query(data: VaildSchema.CommentQuery, opt: {
        resetOpt?: CommentResetOption
    }) {
        let match: any = {
            ownerId: data.ownerId,
            type: data.type,
        };

        // let owner = await CommentMapper.findOwner({
        //     ownerId: data.ownerId,
        //     type: data.type,
        //     mgt: true,
        // });
        let pipeline: any[] = [
            {
                $match: match
            },
            {
                $lookup: {
                    from: UserModel.collection.collectionName,
                    let: { userId: '$userId' },
                    pipeline: [{
                        $match: {
                            $expr: { $eq: ['$$userId', '$_id'] }
                        }
                    }, {
                        $project: {
                            account: 1,
                            nickname: 1,
                            avatar: 1,
                        }
                    }],
                    as: 'user'
                }
            },
            { $unwind: '$user' },
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
            ...BaseMapper.getListOptions(data),
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
        if (detail.status !== myEnum.commentStatus.正常) {
            return {
                _id: detail._id,
                floor: detail.floor,
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
        detail.voteValue = detail.vote ? detail.vote.value : myEnum.voteValue.无;
        delete detail.vote;
        return detail;
    }
}