import { RequestHandler } from 'express';
import { plainToClass } from 'class-transformer';

import { responseHandler, paramsValid } from '../helpers';
import { myEnum } from '../config';
import * as config from '../config';
import { error, escapeRegExp } from '../_system/common';
import * as VaildSchema from '../vaild-schema/class-valid';
import { ArticleModel, ArticleInstanceType, ArticleMapper } from '../models/mongo/article';

export let query: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let user = req.myData.user;
        let data = plainToClass(VaildSchema.AritcleQuery, req.query);
        paramsValid(data);

        let { rows, total } = await ArticleMapper.query(data);
        rows.forEach(detail => {
            ArticleMapper.resetDetail(detail, user);
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
        let detail = await ArticleMapper.detailQuery({ _id: data._id, userId: user._id });
        ArticleMapper.resetDetail(detail, user);
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
            detail = await ArticleModel.create({
                ...data,
                status,
                userId: user._id
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
            ['title', 'content'].forEach(key => {
                update[key] = data[key];
            });
            await detail.update(update);
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
        let rs = await ArticleModel.updateMany({ _id: data.idList, userId: user._id, status: { $ne: myEnum.articleStatus.已删除 } }, { status: myEnum.articleStatus.已删除 });
        if (!rs.n)
            throw error('No Match Data');
    }, req, res);
};

export let mgtAudit: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let data = plainToClass(VaildSchema.ArticleMgtAudit, req.body);
        let rs = await ArticleModel.updateMany({ _id: data.idList, status: myEnum.articleStatus.待审核 }, { status: data.status });
        if (!rs.n)
            throw error('No Match Data');
        return {
            status: data.status,
            statusText: myEnum.articleStatus.getKey(data.status)
        };
    }, req, res);
};