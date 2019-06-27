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
            sort: { _id: -1 },
            page: data.page,
            rows: data.rows
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
        let model: BookmarkInstanceType;
        if (!data._id) {
            delete data._id;
            model = await BookmarkModel.create({
                ...data,
                tagList: data.addTagList
            });
        } else {
            model = await BookmarkModel.findById(data._id);
            if (!model)
                throw error('not exists');
            let update: any = {};
            ['name', 'url'].forEach(key => {
                update[key] = data[key];
            });
            if (data.delTagList && data.delTagList.length) {
                update.$pull = { tagList: { $in: data.delTagList } };
            }
            await transaction(async (session) => {
                await model.update(update, { session });
                if (data.addTagList && data.addTagList.length) {
                    await model.update({ $push: { tagList: { $each: data.addTagList } } }, { session });
                }
            });

        }
        return {
            _id: model._id
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