import { RequestHandler } from 'express';
import { Types } from 'mongoose';
import { responseHandler, paramsValid } from '../helpers';
import { BookmarkModel } from '../models/mongo/bookmark';
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
            delete data.name;
            delete data.url;
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
        if (!data._id) {
            delete data._id;
            await BookmarkModel.create({
                ...data,
                tagList: data.addTagList
            });
        } else {
            let match = await BookmarkModel.findById(data._id);
            if (!match)
                throw error('not exists');
            let update: any = {};
            ['name', 'url'].forEach(key => {
                if (data[key])
                    update[key] = data[key];
            });
            let updateTag = false;
            if (data.delTagList && match.tagList && match.tagList.length) {
                updateTag = true;
                for (let idx = match.tagList.length - 1; idx >= 0; idx--) {
                    let ele = match.tagList[idx];
                    if (data.delTagList.includes(ele))
                        match.tagList.splice(idx, 1);
                }
            }
            if (data.addTagList) {
                updateTag = true;
                if (!match.tagList)
                    match.tagList = data.addTagList;
                else {
                    match.tagList = [...match.tagList, ...data.addTagList];
                }
            }
            if (updateTag)
                update.tagList = match.tagList;
            await match.update(update);
        }
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