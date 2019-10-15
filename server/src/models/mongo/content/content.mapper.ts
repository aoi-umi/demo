import { Types } from 'mongoose';
import { ClientSession } from 'mongodb';

import { myEnum } from '@/config';
import * as config from '@/config';
import { error, escapeRegExp } from '@/_system/common';
import { transaction } from '@/_system/dbMongo';
import * as VaildSchema from '@/vaild-schema/class-valid';

import { LoginUser } from '../../login-user';
import { FileMapper } from '../file';
import { ContentBaseInstanceType, ContentBaseModelType } from './content-base';
import { ContentLogMapper } from './content-log.mapper';
import { BaseMapper } from '../_base';
import { FollowMapper } from '../follow';
import { VoteMapper } from '../vote';
import { UserMapper, UserModel, UserInstanceType } from '../user';
import { ContentLogModel } from './content-log';

export type ContentResetOption = {
    user?: LoginUser,
    imgHost?: string;
};

export type ContentQueryOption<T extends ContentResetOption = ContentResetOption> = {
    audit?: boolean;
    normal?: boolean;
    userId?: Types.ObjectId;
    resetOpt: T;
};

export type ContentUpdateStatusOutOption = {
    idList: Types.ObjectId[],
    toStatus: number;
    user: LoginUser
    includeUserId?: Types.ObjectId | string;
    status?: any;
    logRemark?: string;
}

export class ContentMapper {
    static async query(data: VaildSchema.ContentQuery, opt: {
        model: ContentBaseModelType,
        setMatch?: (match) => void;
        resetDetail?: (data: any) => any;
    } & ContentQueryOption) {
        opt = { ...opt };
        let match: any = {};

        if (data._id) {
            match._id = data._id;
        }

        if (data.userId) {
            match.userId = data.userId;
        }

        if (data.title)
            match.title = new RegExp(escapeRegExp(data.title), 'i');

        if (data.status)
            match.status = { $in: data.status.split(',').map(ele => parseInt(ele)) };

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

        if (and.length)
            match.$and = and;

        opt.setMatch && opt.setMatch(match);

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

        let model = opt.model;
        if (!data.orderBy && opt.normal)
            data.orderBy = 'publishAt';
        let rs = await model.aggregatePaginate(pipeline, {
            ...BaseMapper.getListOptions(data),
            ...opt,
            extraPipeline,
        });
        rs.rows = rs.rows.map(ele => {
            let e = {
                ...ele,
                ...new model(ele).toJSON()
            };
            return opt.resetDetail ? opt.resetDetail(e) : e;
        });
        return rs;
    }

    static async detailQuery(opt: ContentQueryOption & { query: () => Promise<any> }) {
        let detail = await opt.query();
        if (!detail)
            throw error('', config.error.NOT_FOUND);
        let rs = {
            detail,
            log: null as any[]
        };
        if (!opt.normal) {
            let logRs = await ContentLogModel.aggregatePaginate([
                { $match: { contentId: detail._id } },
                ...UserMapper.lookupPipeline(),
                { $sort: { _id: -1 } }
            ]);
            rs.log = logRs.rows.map(ele => {
                let obj = new ContentLogModel(ele).toJSON();
                UserMapper.resetDetail(ele.user, { imgHost: opt.resetOpt.imgHost });
                obj.user = ele.user;
                return obj;
            });
        }
        return rs;
    }

    static resetDetail(detail, opt: ContentResetOption) {
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

    static async updateStatus(opt: {
        model: ContentBaseModelType,
        contentType: number,
        passCond: (detail) => boolean,
        delCond: (detail) => boolean,
        //更新稿件数量
        updateCountInUser: (changeNum: number, user: UserInstanceType, session: ClientSession) => Promise<any>,
    } & ContentUpdateStatusOutOption) {
        let { idList, user, toStatus } = opt;
        let cond: any = { _id: { $in: idList } };
        if (opt.status !== undefined)
            cond.status = opt.status;
        if (opt.includeUserId)
            cond.userId = Types.ObjectId(opt.includeUserId as any);
        let model = opt.model;
        let list = await model.find(cond);
        if (!list.length)
            throw error('', config.error.NO_MATCH_DATA);
        let detail = list[0];
        if (detail.status === toStatus)
            return;
        let bulk = [];
        let dbUser = await UserModel.findById(user._id);
        let changeNum = 0;
        if (opt.passCond(detail)) {
            changeNum = 1;
            let now = new Date();
            bulk = list.map(ele => {
                let update = { status: toStatus, publishAt: now };
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
            if (opt.delCond(detail))
                changeNum = -1;
            bulk = [{
                updateMany: {
                    filter: cond,
                    update: {
                        $set: { status: toStatus }
                    }
                }
            }]
        }
        let log = list.map(ele => {
            return ContentLogMapper.create(ele, user, {
                contentType: opt.contentType,
                srcStatus: ele.status, destStatus: toStatus, remark: opt.logRemark
            });
        });

        await transaction(async (session) => {
            if (changeNum)
                await opt.updateCountInUser(changeNum, dbUser, session);
            await model.bulkWrite(bulk, { session });
            await ContentLogModel.insertMany(log, { session });
        });
    }

    static async mgtSave(data: VaildSchema.ContentSave, opt: {
        user: LoginUser,
        contentType: number,
        saveKey: string[],
        model: ContentBaseModelType,
        status: number,
        getDetail: () => Promise<ContentBaseInstanceType>,
    }) {
        let { user } = opt;
        let detail: ContentBaseInstanceType;
        let status = opt.status;

        let saveData = {};
        opt.saveKey.forEach(key => {
            saveData[key] = data[key];
        });
        if (!data._id) {
            detail = new opt.model({
                ...saveData,
                status,
                userId: user._id,
            });
            let log = ContentLogMapper.create(detail, user, {
                contentType: opt.contentType,
                srcStatus: status, destStatus: status, remark: detail.remark
            });
            await transaction(async (session) => {
                await detail.save({ session });
                await log.save({ session });
            });
        } else {
            detail = await opt.getDetail();
            if (!user.equalsId(detail.userId))
                throw error('', config.error.NO_PERMISSIONS);
            if (!detail.canUpdate) {
                throw error('当前状态无法修改');
            }
            let update: any = {
                ...saveData,
                status,
            };
            let logRemark = update.remark == detail.remark ? null : update.remark;
            let log = ContentLogMapper.create(detail, user, {
                contentType: opt.contentType,
                srcStatus: detail.status, destStatus: status, remark: logRemark
            });
            await transaction(async (session) => {
                await detail.update(update);
                await log.save({ session });
            });
        }
        return detail;
    }
}