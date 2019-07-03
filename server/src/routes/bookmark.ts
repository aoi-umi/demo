import { RequestHandler } from 'express';
import { Types } from 'mongoose';
import { plainToClass } from 'class-transformer';

import { responseHandler, paramsValidV2 } from '../helpers';
import { error, escapeRegExp } from '../_system/common';
import { transaction } from '../_system/dbMongo';
import { BookmarkModel, BookmarkInstanceType } from '../models/mongo/bookmark';
import * as VaildSchema from '../vaild-schema/class-valid';

export let query: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let data = plainToClass(VaildSchema.BookmarkQuery, req.query);
        paramsValidV2(data);
        let query: any = {};
        if (data.anyKey) {
            let anykey = new RegExp(escapeRegExp(data.anyKey), 'i');
            query.$or = [
                { url: anykey },
                { name: anykey },
                { tagList: anykey }
            ];
        }

        if (data.name)
            query.name = new RegExp(escapeRegExp(data.name), 'i');
        if (data.url)
            query.url = new RegExp(escapeRegExp(data.url), 'i');

        let { rows, total } = await BookmarkModel.findAndCountAll({
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

export let save: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let data = plainToClass(VaildSchema.BookmarkSave, req.body);
        paramsValidV2(data);
        let detail: BookmarkInstanceType;
        if (!data._id) {
            delete data._id;
            detail = await BookmarkModel.create({
                ...data,
                tagList: data.addTagList
            });
        } else {
            detail = await BookmarkModel.findById(data._id);
            if (!detail)
                throw error('not exists');
            let update: any = {};
            ['name', 'url'].forEach(key => {
                update[key] = data[key];
            });
            if (data.delTagList && data.delTagList.length) {
                detail.tagList = detail.tagList.filter(ele => !data.delTagList.includes(ele));
            }
            if (data.addTagList && data.addTagList.length) {
                detail.tagList = [...detail.tagList, ...data.addTagList];
            }
            update.tagList = detail.tagList;
            await detail.update(update);
        }
        return {
            _id: detail._id
        };
    }, req, res);
}

export let del: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let data = plainToClass(VaildSchema.BookmarkDel, req.body);
        paramsValidV2(data);
        let rs = await BookmarkModel.deleteMany({ _id: { $in: data.idList.map(id => Types.ObjectId(id)) } });
        if (!rs.n)
            throw error('No Match Data');
    }, req, res);
}