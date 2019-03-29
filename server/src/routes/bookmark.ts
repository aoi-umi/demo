import { RequestHandler } from 'express';
import { Types } from 'mongoose';
import { responseHandler, paramsValid } from '../helpers';
import { BookmarkModel, BookmarkInstanceType } from '../models/mongo/bookmark';
import { error } from '../_system/common';

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
            let updateTag = false;
            if (data.delTagList && model.tagList && model.tagList.length) {
                updateTag = true;
                for (let idx = model.tagList.length - 1; idx >= 0; idx--) {
                    let ele = model.tagList[idx];
                    if (data.delTagList.includes(ele))
                        model.tagList.splice(idx, 1);
                }
            }
            if (data.addTagList) {
                updateTag = true;
                if (!model.tagList)
                    model.tagList = data.addTagList;
                else {
                    model.tagList = [...model.tagList, ...data.addTagList];
                }
            }
            if (updateTag)
                update.tagList = model.tagList;
            await model.update(update);
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