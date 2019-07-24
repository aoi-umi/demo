import { Types } from 'mongoose';

import { error, escapeRegExp } from '../../../_system/common';
import { Auth } from '../../../_system/auth';
import { ListBase, AritcleQuery } from '../../../vaild-schema/class-valid';
import * as config from '../../../config';
import { BaseMapper } from '../_base';
import { UserModel } from '../user';

import { ArticleModel } from "./article";
import { myEnum } from '../../../config';

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
        return detail;
    }

    static async findOne(data) {
        let detail = await ArticleModel.findOne(data);
        if (!detail)
            throw error('not exists');
        return detail;
    }

    static resetDetail(detail, user: Express.MyDataUser) {
        let rs = {
            canDel: detail.status !== myEnum.articleStatus.已删除 && (detail.userId == user._id || Auth.contains(user, config.auth.articleMgtDel)),
            canUpdate: detail.canUpdate && detail.userId == user._id,
        };
        detail.canDel = rs.canDel;
        detail.canUpdate = rs.canUpdate;
        return rs;
    }
};