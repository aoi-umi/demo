import { RequestHandler } from 'express';

import { responseHandler, paramsValid } from '../helpers';
import * as VaildSchema from '../vaild-schema/class-valid';
import { NotifyModel } from '../models/mongo/notify';
import { BaseMapper } from '../models/mongo/_base';
import { AssetLogModel } from '../models/mongo/asset';

export const notifyQuery: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let data = paramsValid(req.query, VaildSchema.AssetNotifyQuery);
        let match: any = {};
        let { rows, total } = await NotifyModel.findAndCountAll({
            conditions: match,
            ...BaseMapper.getListOptions(data)
        });
        return {
            rows,
            total
        };
    }, req, res);
};

export const logQuery: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let data = paramsValid(req.query, VaildSchema.AssetLogQuery);
        let match: any = {};
        let { rows, total } = await AssetLogModel.findAndCountAll({
            conditions: match,
            ...BaseMapper.getListOptions(data)
        });
        return {
            rows,
            total
        };
    }, req, res);
};