import { RequestHandler } from 'express';

import { responseHandler, paramsValid } from '../helpers';
import * as VaildSchema from '../vaild-schema/class-valid';
import { NotifyModel } from '../models/mongo/notify';
import { BaseMapper } from '../models/mongo/_base';
import { AssetLogModel } from '../models/mongo/asset';
import { escapeRegExp } from '../_system/common';

export const notifyQuery: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let data = paramsValid(req.query, VaildSchema.AssetNotifyQuery);
        let match: any = {};
        if (data.orderNo)
            match.orderNo = new RegExp(escapeRegExp(data.orderNo), 'i');
        if (data.outOrderNo)
            match.outOrderNo = new RegExp(escapeRegExp(data.outOrderNo), 'i');
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
        if (data.orderNo)
            match.orderNo = new RegExp(escapeRegExp(data.orderNo), 'i');
        if (data.outOrderNo)
            match.outOrderNo = new RegExp(escapeRegExp(data.outOrderNo), 'i');
        if (data.status)
            match.status = { $in: data.status.split(',') };

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