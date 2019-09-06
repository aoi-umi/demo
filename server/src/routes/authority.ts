import { RequestHandler } from 'express';

import { responseHandler, paramsValid } from '../helpers';
import * as config from '../config';
import { error } from '../_system/common';
import * as VaildSchema from '../vaild-schema/class-valid';
import { AuthorityModel, AuthorityInstanceType, AuthorityMapper } from '../models/mongo/authority';

export let query: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let data = paramsValid(req.query, VaildSchema.AuthorityQuery);
        let { rows, total } = await AuthorityMapper.query(data);

        return {
            rows,
            total
        };
    }, req, res);
};

export let codeExists: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let data = paramsValid(req.body, VaildSchema.AuthorityCodeExists);
        let rs = await AuthorityMapper.codeExists(data.code, data._id);
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
        } = req.body;
        let model: AuthorityInstanceType;
        let rs = await AuthorityMapper.codeExists(data.code, data._id);
        if (rs)
            throw error('code已存在');
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
            ['name', 'code', 'status'].forEach(key => {
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
        let data = paramsValid(req.body, VaildSchema.AuthorityDel);
        let rs = await AuthorityModel.deleteMany({ _id: { $in: data.idList } });
        if (!rs.n)
            throw error('', config.error.NO_MATCH_DATA);
    }, req, res);
}