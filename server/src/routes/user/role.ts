import { RequestHandler } from 'express';

import { responseHandler, paramsValid } from '@/helpers';
import { error } from '@/_system/common';
import * as config from '@/config';
import * as VaildSchema from '@/vaild-schema/class-valid';
import { RoleModel, RoleInstanceType, RoleMapper } from '@/models/mongo/role';

export let query: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let data = paramsValid(req.query, VaildSchema.RoleQuery);
        let { rows, total } = await RoleMapper.query({ ...data, includeDelAuth: true });
        return {
            rows,
            total
        };
    }, req, res);
};

export let codeExists: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let data = paramsValid(req.body, VaildSchema.RoleCodeExists);
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
        let detail: RoleInstanceType;
        let rs = await RoleMapper.codeExists(data.code, data._id);
        if (rs)
            throw error('code已存在');
        if (!data._id) {
            delete data._id;
            detail = await RoleModel.create({
                ...data,
                authorityList: data.addAuthList,
            });
        } else {
            detail = await RoleModel.findById(data._id);
            if (!detail)
                throw error('not exists');
            let update: any = {};
            ['name', 'code', 'status'].forEach(key => {
                update[key] = data[key];
            });

            if (data.delAuthList && data.delAuthList.length) {
                detail.authorityList = detail.authorityList.filter(ele => !data.delAuthList.includes(ele));
            }
            if (data.addAuthList && data.addAuthList.length) {
                detail.authorityList = [...detail.authorityList, ...data.addAuthList];
            }
            update.authorityList = detail.authorityList;
            await detail.update(update);
        }
        return {
            _id: detail._id
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
        let data = paramsValid(req.body, VaildSchema.RoleDel);
        let rs = await RoleModel.deleteMany({ _id: { $in: data.idList } });
        if (!rs.n)
            throw error('', config.error.NO_MATCH_DATA);
    }, req, res);
}