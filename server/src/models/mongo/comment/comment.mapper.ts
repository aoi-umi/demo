import { Types } from 'mongoose';
import * as VaildSchema from '../../../vaild-schema/class-valid';
import { Auth } from '../../../_system/auth';
import * as config from '../../../config';
import { myEnum } from '../../../config';
import { LoginUser } from '../../login-user';
import { BaseMapper, ContentBaseInstanceType } from '../_base';
import { ArticleMapper } from '../article';
import { UserModel, UserMapper, UserDocType, UserResetOption } from '../user';
import { FileMapper } from '../file';
import { CommentModel, CommentDocType, CommentInstanceType } from './comment';
import { VoteModel, VoteMapper } from '../vote';
import { FollowMapper } from '../follow';

type CommentResetOption = {
    imgHost?: string;
    user?: LoginUser
    authorId?: Types.ObjectId;
    quoteUserList?: UserDocType[];
};
export class CommentMapper {
    static async create(data: VaildSchema.CommentSubmit, type, user: LoginUser) {
        let lastComment = await CommentModel.findOne({ ownerId: data.ownerId }).sort({ floor: -1 });
        let quote: CommentInstanceType;
        if (data.quoteId)
            quote = await CommentModel.findById(data.quoteId);

        let obj: any = {
            userId: user._id,
            ownerId: data.ownerId,
            comment: data.comment,
            topId: data.topId,
            type: type,
            floor: lastComment ? lastComment.floor + 1 : 1
        };
        if (quote) {
            obj.quoteId = quote._id;
            obj.quoteUserId = quote.userId;
        }
        let comment = new CommentModel(obj);
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

        let quoteList = rs.rows.filter(ele => ele.quoteUserId);
        let quoteUserList: UserDocType[];
        if (quoteList.length) {
            quoteUserList = await CommentMapper.quoteUserQuery(quoteList.map(ele => ele.quoteUserId), { imgHost: resetOpt.imgHost });
        }

        rs.rows = rs.rows.map(detail => {
            return this.resetDetail(detail, {
                ...resetOpt,
                quoteUserList
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
        let { quoteUserList } = opt;
        if (quoteUserList && quoteUserList.length) {
            detail.quoteUser = quoteUserList.find(u => u._id.equals(detail.quoteUserId));
        }
        detail.voteValue = detail.vote ? detail.vote.value : myEnum.voteValue.无;
        delete detail.vote;
        let { user } = opt;
        if (user) {
            let rs = {
                canDel: detail.status !== myEnum.commentStatus.已删除
                    && (user.equalsId(detail.userId)
                        || Auth.contains(user, config.auth.commentMgtDel)
                        // || (opt.authorId && opt.authorId.equals(user._id))
                    ),
            };
            detail.canDel = rs.canDel;
        }
        if (detail.user) {
            UserMapper.resetDetail(detail.user, { imgHost: opt.imgHost });
            detail.user.followStatus = detail.follow ? detail.follow.status : myEnum.followStatus.未关注;
        }
        delete detail.follow;
        if (detail.status !== myEnum.commentStatus.正常) {
            detail.isDel = true;
            delete detail.comment;
            delete detail.user;
        }
        return detail;
    }

    static async quoteUserQuery(userId, opt?: UserResetOption) {
        let quoteUserList = await UserModel.find({ _id: userId }, {
            account: 1,
            nickname: 1,
            avatar: 1,
        }).lean();
        quoteUserList.forEach(ele => {
            UserMapper.resetDetail(ele, opt);
        });
        return quoteUserList;
    }
}