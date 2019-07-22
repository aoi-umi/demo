import { RequestHandler } from 'express';
import { Types } from 'mongoose';
import { plainToClass } from 'class-transformer';

import { responseHandler, paramsValid } from '../helpers';
import { error, escapeRegExp } from '../_system/common';
import * as VaildSchema from '../vaild-schema/class-valid';
import { ArticleModel, ArticleInstanceType, ArticleMapper } from '../models/mongo/article';
import { myEnum } from '../config';

export let query: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let data = plainToClass(VaildSchema.AritcleQuery, req.query);
        paramsValid(data);
        let query: any = {};
        if (data.anyKey) {
            let anykey = new RegExp(escapeRegExp(data.anyKey), 'i');
            query.$or = [
                { title: anykey },
            ];
        }

        if (data.title)
            query.title = new RegExp(escapeRegExp(data.title), 'i');

        let { rows, total } = await ArticleModel.findAndCountAll({
            conditions: query,
            page: data.page,
            rows: data.rows,
            sortOrder: data.sortOrder,
            orderBy: data.orderBy
        });
        return {
            rows,
            total
        };
    }, req, res);
};

export let detail: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let user = req.myData.user;
        let data = plainToClass(VaildSchema.AritcleSave, req.query);
        let detail = await ArticleMapper.findOne({ _id: data._id, userId: user._id });
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
            detail = await ArticleMapper.findOne({ _id: data._id, userId: user._id });
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
        let rs = await ArticleModel.updateMany({ _id: data.idList, userId: user._id }, { status: myEnum.articleStatus.已删除 });
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
    }, req, res);
};