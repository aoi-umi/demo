import { Types } from 'mongoose';

import * as config from '../../../config';
import { myEnum } from '../../../config';
import { ListBase, AritcleQuery } from '../../../vaild-schema/class-valid';
import { error, escapeRegExp } from '../../../_system/common';
import { Auth } from '../../../_system/auth';
import { transaction } from '../../../_system/dbMongo';
import { LoginUser } from '../../login-user';
import { BaseMapper } from '../_base';
import { UserModel, UserMapper } from '../user';
import { FileMapper } from '../file';

import { VoteModel, VoteMapper } from '../vote';
import { ArticleInstanceType, ArticleModel } from "./article";
import { ArticleLogModel } from './article-log';
import { FollowMapper } from '../follow';

type ArticleResetOption = {
    user?: LoginUser,
    imgHost?: string;
};

type ArticleQueryOption = {
    audit?: boolean;
    normal?: boolean;
    userId?: string;
    resetOpt: ArticleResetOption;
};

export class ArticleMapper {
    static async query(data: AritcleQuery, opt: {
        noTotal?: boolean,
    } & ArticleQueryOption) {
        opt = { ...opt };
        let match: any = {};

        if (data._id) {
            match._id = data._id;
        }

        if (data.userId) {
            match.userId = data.userId;
        }
        let and = [];
        if (data.user) {
            let user = new RegExp(escapeRegExp(data.user), 'i');
            and.push({
                $or: [
                    { 'user.nickname': user },
                    { 'user.account': user },
                ]
            });
        }
        if (data.anyKey) {
            let anykey = new RegExp(escapeRegExp(data.anyKey), 'i');
            and.push({
                $or: [
                    { title: anykey },
                    { content: anykey },
                    { profile: anykey },
                    { 'user.nickname': anykey },
                    { 'user.account': anykey },
                ]
            });
        }
        if (and.length)
            match.$and = and;

        if (data.title)
            match.title = new RegExp(escapeRegExp(data.title), 'i');

        if (data.status)
            match.status = { $in: data.status.split(',').map(ele => parseInt(ele)) };

        let userId = opt.userId && Types.ObjectId(opt.userId);
        if (opt.normal) {
            match.status = myEnum.articleStatus.审核通过;
            match.publishAt = { $lte: new Date() };
        } else if (opt.audit) {
            //排除非本人的草稿
            match.$expr = {
                $not: {
                    $and: [
                        { $ne: ['$userId', userId] },
                        { $eq: ['$status', myEnum.articleStatus.草稿] }
                    ]
                }

            };
        } else {
            match.userId = userId;
        }

        let pipeline: any[] = [
            ...UserMapper.lookupPipeline(),
            { $match: match },
        ];
        let resetOpt = { ...opt.resetOpt };
        let extraPipeline = [];
        if (opt.normal && resetOpt.user) {
            extraPipeline = [
                ...VoteMapper.lookupPipeline({
                    userId: resetOpt.user._id
                }),
                ...FollowMapper.lookupPipeline({
                    userId: resetOpt.user._id,
                })
            ];
        }

        let rs = await ArticleModel.aggregatePaginate(pipeline, {
            ...BaseMapper.getListOptions(data),
            ...opt,
            extraPipeline,
        });
        rs.rows = rs.rows.map(ele => {
            let e = {
                ...ele,
                ...new ArticleModel(ele).toJSON()
            };
            return this.resetDetail(e, resetOpt);
        });
        return rs;
    }

    static async detailQuery(data, opt: ArticleQueryOption) {
        let { rows } = await this.query(data, { ...opt, noTotal: true });
        let detail = rows[0];
        if (!detail)
            throw error('', config.error.NOT_FOUND);
        let rs = {
            detail,
            log: null as any[]
        };
        if (!opt.normal) {
            let logRs = await ArticleLogModel.aggregatePaginate([
                { $match: { articleId: detail._id } },
                ...UserMapper.lookupPipeline(),
                { $sort: { _id: -1 } }
            ]);
            rs.log = logRs.rows.map(ele => {
                let obj = new ArticleLogModel(ele).toJSON();
                UserMapper.resetDetail(ele.user, { imgHost: opt.resetOpt.imgHost });
                obj.user = ele.user;
                return obj;
            });
        }
        return rs;
    }

    static async findOne(data) {
        let detail = await ArticleModel.findOne(data);
        if (!detail)
            throw error('', config.error.NOT_FOUND);
        return detail;
    }

    static resetDetail(detail, opt: ArticleResetOption) {
        let { user } = opt;
        if (user) {
            let rs = {
                canDel: detail.status !== myEnum.articleStatus.已删除 && (detail.userId == user._id || Auth.contains(user, config.auth.articleMgtDel)),
                canUpdate: detail.canUpdate && detail.userId == user._id,
            };
            detail.canDel = rs.canDel;
            detail.canUpdate = rs.canUpdate;
        }

        detail.coverUrl = FileMapper.getImgUrl(detail.cover, opt.imgHost);
        if (detail.user) {
            detail.user.avatarUrl = FileMapper.getImgUrl(detail.user.avatar, opt.imgHost);
            detail.user.followStatus = detail.follow ? detail.follow.status : myEnum.followStatus.未关注;
        }
        delete detail.follow;
        detail.voteValue = detail.vote ? detail.vote.value : myEnum.voteValue.无;
        delete detail.vote;
        return detail;
    }

    static async updateStatus(idList: Types.ObjectId[], status: number, user: LoginUser, opt?: {
        includeUserId?: Types.ObjectId | string;
        status?: any;
        logRemark?: string;
    }) {
        opt = {
            ...opt,
        };
        let cond: any = { _id: { $in: idList } };
        if (opt.status !== undefined)
            cond.status = opt.status;
        if (opt.includeUserId)
            cond.userId = Types.ObjectId(opt.includeUserId as any);
        let list = await ArticleModel.find(cond);
        if (!list.length)
            throw error('', config.error.NO_MATCH_DATA);
        let bulk = [];
        let dbUser = await UserModel.findById(user._id);
        let articleChange = 0;
        if (status === myEnum.articleStatus.审核通过) {
            articleChange = 1;
            let now = new Date();
            bulk = list.map(ele => {
                let update = { status, publishAt: now };
                //指定时间发布
                if (ele.setPublish && ele.setPublishAt && ele.setPublishAt.getTime() > now.getTime()) {
                    update.publishAt = ele.setPublishAt;
                }
                return {
                    updateOne: {
                        filter: { ...cond, _id: ele._id },
                        update: {
                            $set: update
                        }
                    }
                }
            });
        } else {
            if (status === myEnum.articleStatus.已删除)
                articleChange = 1;
            bulk = [{
                updateMany: {
                    filter: cond,
                    update: {
                        $set: { status }
                    }
                }
            }]
        }
        let log = list.map(ele => {
            return ArticleLogMapper.create(ele, user, { srcStatus: ele.status, destStatus: status, remark: opt.logRemark });
        });

        await transaction(async (session) => {
            if (articleChange)
                await dbUser.update({ article: dbUser.article + articleChange }, { session });
            await ArticleModel.bulkWrite(bulk, { session });
            await ArticleLogModel.insertMany(log, { session });
        });
        return {
            status: status,
            statusText: myEnum.articleStatus.getKey(status)
        };
    }
};

export class ArticleLogMapper {
    static create(article: ArticleInstanceType, user: LoginUser, opt: {
        srcStatus: number,
        destStatus: number,
        remark?: string;
    }) {
        let log = new ArticleLogModel({
            articleId: article._id,
            userId: user._id,
            srcStatus: opt.srcStatus,
            destStatus: opt.destStatus,
            logUser: user.nameToString(),
        });
        log.remark = opt.remark || (myEnum.articleStatus.getKey(log.srcStatus) + '=>' + myEnum.articleStatus.getKey(log.destStatus));
        return log;
    }

    static resetDetail(log: any) {
        return log;
    }
}