import { RequestHandler } from 'express';
import { Types } from 'mongoose';
import { responseHandler, paramsValid } from '../helpers';
import { AuthorityModel, AuthorityInstanceType } from '../models/mongo/authority';
import { error } from '../_system/common';

export let query: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let schema = {};
        let data: {
            code: string;
            name: string;
            status: string;
            anyKey: string;
        } & ApiListQueryArgs = req.query;
        paramsValid(schema, data, { list: true });
        let query: any = {};
        if (data.anyKey) {
            delete data.name;
            delete data.code;
            let anykey = new RegExp(data.anyKey, 'i');
            query.$or = [
                { code: anykey },
                { name: anykey },
            ];
        }

        if (data.name)
            query.name = new RegExp(data.name, 'i');
        if (data.code)
            query.code = new RegExp(data.code, 'i');
        if (data.status)
            query.status = data.status;

        let { rows, total } = await AuthorityModel.findAndCountAll({
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
            code?: string;
            status?: string;
        } = req.body;
        let model: AuthorityInstanceType;
        if (!data._id) {
            delete data._id;
            model = await AuthorityModel.create({
                ...data,
            });
        } else {
            model = await AuthorityModel.findById(data._id);
            if (!model)
                throw error('not exists');
            let update: any = {};
            ['name', 'status'].forEach(key => {
                update[key] = data[key];
            });
            await model.update(update);
        }
        return {
            _id: model._id
        };
    }, req, res);
}

export let update: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let data: {
            _id: string;
            status?: string;
        } & Object = req.body;
        let model = await AuthorityModel.findById(data._id);
        if (!model)
            throw error('not exists');
        let update: any = {};
        ['status'].forEach(key => {
            if (data.hasOwnProperty(key))
                update[key] = data[key];
        });
        await model.update(update);

        return {
            _id: model._id
        };
    }, req, res);
}

export let del: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let data = req.body;
        let rs = await AuthorityModel.deleteMany({ _id: { $in: data.idList.map(id => Types.ObjectId(id)) } });
        if (!rs.n)
            throw error('No Match Data');
    }, req, res);
}