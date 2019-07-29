import { Types } from 'mongoose';

import * as config from '../../../config';
import { myEnum } from '../../../config';
import { ListBase, AritcleQuery } from '../../../vaild-schema/class-valid';
import { error, escapeRegExp } from '../../../_system/common';
import { Auth } from '../../../_system/auth';
import { transaction } from '../../../_system/dbMongo';
import { BaseMapper } from '../_base';
import { UserModel } from '../user';
import { FileMapper } from '../file';

import { ArticleInstanceType, ArticleModel } from "./article";
import { ArticleLogModel } from './article-log';

export class ArticleMapper {
    static async query(data: AritcleQuery, opt?: { noTotal?: boolean }) {
        let match: any = {};

        if (data._id) {
            match._id = Types.ObjectId(data._id);
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

        let pipeline: any[] = [
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
                            nickname: 1
                        }
                    }],
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            { $match: match },
        ];

        opt = { ...opt };
        let rs = await ArticleModel.aggregatePaginate(pipeline, {
            ...BaseMapper.getListOptions(data),
            ...opt,
        });
        rs.rows = rs.rows.map(ele => {
            let e = new ArticleModel(ele).toJSON();
            e.user = ele.user;
            return e;
        });
        return rs;
    }

    static async detailQuery(data) {
        let { rows } = await this.query(data, { noTotal: true });
        let detail = rows[0];
        if (!detail)
            throw error('not exists');
        let log = await ArticleLogModel.find({ articleId: detail._id }).sort({ _id: -1 });

        detail.log = log.map(ele => {
            return ArticleLogMapper.reset(ele.toJSON());
        });
        return detail;
    }

    static async findOne(data) {
        let detail = await ArticleModel.findOne(data);
        if (!detail)
            throw error('not exists');
        return detail;
    }

    static resetDetail(detail, user: Express.MyDataUser, opt?: {
        imgHost?: string;
    }) {
        let rs = {
            canDel: detail.status !== myEnum.articleStatus.已删除 && (detail.userId == user._id || Auth.contains(user, config.auth.articleMgtDel)),
            canUpdate: detail.canUpdate && detail.userId == user._id,
        };
        detail.canDel = rs.canDel;
        detail.canUpdate = rs.canUpdate;
        opt = {
            ...opt,
        };
        detail.coverUrl = FileMapper.getImgUrl(detail.cover, opt.imgHost);
        return rs;
    }

    static async updateStatus(idList: Types.ObjectId[], status: number, user: Express.MyDataUser, opt?: {
        includeUserId?: Types.ObjectId | string;
        status?: any;
    }) {
        opt = {
            ...opt,
        };
        let cond: any = { _id: idList };
        if (opt.status !== undefined)
            cond.status = opt.status;
        if (opt.includeUserId)
            cond.userId = Types.ObjectId(opt.includeUserId as any);
        let list = await ArticleModel.find(cond);
        if (!list.length)
            throw error('No Match Data');
        let log = list.map(ele => {
            return ArticleLogMapper.create(ele, user, { srcStatus: ele.status, destStatus: status });
        });

        await transaction(async (session) => {
            let rs = await ArticleModel.updateMany(cond, { status }, { session });
            await ArticleLogModel.insertMany(log, { session });
        });
        return {
            status: status,
            statusText: myEnum.articleStatus.getKey(status)
        };
    }
};

export class ArticleLogMapper {
    static create(article: ArticleInstanceType, user: Express.MyDataUser, opt: {
        srcStatus: number,
        destStatus: number,
        remark?: string
    }) {
        let log = new ArticleLogModel({
            articleId: article._id,
            userId: user._id,
            srcStatus: opt.srcStatus,
            destStatus: opt.destStatus,
            user: user.nickname + '(' + user.account + ')',
        });
        log.remark = opt.remark || (myEnum.articleStatus.getKey(log.srcStatus) + '=>' + myEnum.articleStatus.getKey(log.destStatus));
        return log;
    }

    static reset(log: any) {
        log.srcStatusText = myEnum.articleStatus.getKey(log.srcStatus);
        log.destStatusText = myEnum.articleStatus.getKey(log.destStatus);
        return log;
    }
}