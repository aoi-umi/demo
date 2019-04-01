import { RequestHandler } from 'express';
import { Types } from 'mongoose';
import { responseHandler, paramsValid } from '../helpers';
import { error } from '../_system/common';
import { transaction } from '../_system/dbMongo';
import { RoleModel, RoleInstanceType, RoleMapper, RoleQueryArgs } from '../models/mongo/role';

export let query: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let schema = {};
        let data: RoleQueryArgs = req.query;
        paramsValid(schema, data, { list: true });
        let { rows, total } = await RoleMapper.query(data);
        return {
            rows,
            total
        };
    }, req, res);
};

export let codeExists: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let schema = {
            required: ['code']
        };
        let data: {
            _id?: string;
            code: string;
        } = req.body;
        paramsValid(schema, data);
        let rs = await RoleMapper.codeExists(data.code, data._id);
        return rs && { _id: rs._id };
    }, req, res);
};

export let save: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let data: {
            _id?: string;
            name?: string;
            code?: string;
            status?: string;
            delAuthList?: string[];
            addAuthList?: string[];
        } = req.body;
        let model: RoleInstanceType;
        let rs = await RoleMapper.codeExists(data.code, data._id);
        if (rs)
            throw error('code已存在');
        if (!data._id) {
            delete data._id;
            model = await RoleModel.create({
                ...data,
                authorityList: data.addAuthList,
            });
        } else {
            model = await RoleModel.findById(data._id);
            if (!model)
                throw error('not exists');
            let update: any = {};
            ['name', 'code', 'status'].forEach(key => {
                update[key] = data[key];
            });

            if (data.delAuthList && data.delAuthList.length) {
                update.$pull = { authorityList: { $in: data.delAuthList } };
            }
            await transaction(async (session) => {
                await model.update(update, { session });
                if (data.addAuthList && data.addAuthList.length) {
                    await model.update({ $push: { authorityList: { $each: data.addAuthList } } }, { session });
                }
            });
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
        let model = await RoleModel.findById(data._id);
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
        let rs = await RoleModel.deleteMany({ _id: { $in: data.idList.map(id => Types.ObjectId(id)) } });
        if (!rs.n)
            throw error('No Match Data');
    }, req, res);
}