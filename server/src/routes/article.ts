import { RequestHandler } from 'express';
import { plainToClass } from 'class-transformer';

import { responseHandler, paramsValid } from '../helpers';
import { myEnum } from '../config';
import * as config from '../config';
import { error, escapeRegExp } from '../_system/common';
import { transaction } from '../_system/dbMongo';
import * as VaildSchema from '../vaild-schema/class-valid';
import { ArticleModel, ArticleInstanceType, ArticleMapper, ArticleLogMapper } from '../models/mongo/article';
import { Auth } from '../_system/auth';

export let query: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let user = req.myData.user;
        let data = plainToClass(VaildSchema.AritcleQuery, req.query);
        paramsValid(data);

        let { rows, total } = await ArticleMapper.query(data, { userId: user._id, mgt: Auth.contains(user, config.auth.articleMgtAudit) });
        rows.forEach(detail => {
            ArticleMapper.resetDetail(detail, user, {
                imgHost: req.headers.host
            });
        });
        return {
            rows,
            total
        };
    }, req, res);
};

export let detailQuery: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let user = req.myData.user;
        let data = plainToClass(VaildSchema.AritcleSave, req.query);
        let detail = await ArticleMapper.detailQuery({ _id: data._id }, { userId: user._id, mgt: Auth.contains(user, config.auth.articleMgtAudit) });
        ArticleMapper.resetDetail(detail, user, {
            imgHost: req.headers.host
        });
        return detail;
    }, req, res);
};

export let save: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let user = req.myData.user;
        let data = plainToClass(VaildSchema.AritcleSave, req.body);
        paramsValid(data);
        let detail: ArticleInstanceType;
        let status = data.submit ? myEnum.articleStatus.待审核 : myEnum.articleStatus.草稿;
        if (!data._id) {
            delete data._id;
            detail = new ArticleModel({
                ...data,
                status,
                userId: user._id
            });
            let log = ArticleLogMapper.create(detail, user, { srcStatus: myEnum.articleStatus.草稿, destStatus: status });
            await transaction(async (session) => {
                await detail.save({ session });
                await log.save({ session });
            });
        } else {
            detail = await ArticleMapper.findOne({ _id: data._id });
            if (detail.userId.toString() !== user._id)
                throw error('', config.error.NO_PERMISSIONS);
            if (!detail.canUpdate) {
                throw error('当前状态无法修改');
            }
            let update: any = {
                status,
            };
            ['cover', 'title', 'content'].forEach(key => {
                update[key] = data[key];
            });
            let log = ArticleLogMapper.create(detail, user, { srcStatus: detail.status, destStatus: status });
            await transaction(async (session) => {
                await detail.update(update);
                await log.save({ session });
            });
        }
        return {
            _id: detail._id
        };
    }, req, res);
};

export let del: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let user = req.myData.user;
        let data = plainToClass(VaildSchema.ArticleDel, req.body);
        paramsValid(data);
        await ArticleMapper.updateStatus(data.idList, myEnum.articleStatus.已删除, user, {
            includeUserId: user._id,
            status: { $ne: myEnum.articleStatus.已删除 },
        });
    }, req, res);
};

export let mgtAudit: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let user = req.myData.user;
        let data = plainToClass(VaildSchema.ArticleMgtAudit, req.body);
        let rs = await ArticleMapper.updateStatus(data.idList, data.status, user, {
            status: myEnum.articleStatus.待审核,
        });
        return rs;
    }, req, res);
};