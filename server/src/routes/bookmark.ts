import { RequestHandler } from 'express';
import { Types } from 'mongoose';
import { responseHandler, paramsValid } from '../helpers';
import { error } from '../_system/common';
import { transaction } from '../_system/dbMongo';
import { BookmarkModel, BookmarkInstanceType } from '../models/mongo/bookmark';

export let query: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let schema = {};
        let data: {
            name: string;
            url: string;
            anyKey: string;
        } & ApiListQueryArgs = req.query;
        paramsValid(schema, data, { list: true });
        let query: any = {};
        if (data.anyKey) {
            let anykey = new RegExp(data.anyKey, 'i');
            query.$or = [
                { url: anykey },
                { name: anykey },
                { tagList: anykey }
            ];
        }

        if (data.name)
            query.name = new RegExp(data.name, 'i');
        if (data.url)
            query.url = new RegExp(data.url, 'i');

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
        let data: {
            _id?: string;
            name?: string;
            url?: string;
            addTagList?: string[];
            delTagList?: string[];
        } = req.body;
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
        let data = req.body;
        let rs = await BookmarkModel.deleteMany({ _id: { $in: data.idList.map(id => Types.ObjectId(id)) } });
        if (!rs.n)
            throw error('No Match Data');
    }, req, res);
}