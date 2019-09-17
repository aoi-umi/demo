import { RequestHandler } from 'express';

import { responseHandler, paramsValid } from '@/helpers';
import * as VaildSchema from '@/vaild-schema/class-valid';
import { ThirdPartyPayMapper } from '@/3rd-party';

import { NotifyMapper } from '@/models/mongo/notify';
import { AssetLogMapper } from '@/models/mongo/asset';

export const notifyQuery: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let data = paramsValid(req.query, VaildSchema.AssetNotifyQuery);
        let { rows, total } = await NotifyMapper.query(data);
        return {
            rows,
            total
        };
    }, req, res);
};

export const notifyRetry: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let data = paramsValid(req.body, VaildSchema.AssetNotifyRetry);
        await ThirdPartyPayMapper.notifyHandler({ notifyId: data._id });
    }, req, res);
}

export const logQuery: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let data = paramsValid(req.query, VaildSchema.AssetLogQuery);

        let { rows, total } = await AssetLogMapper.query(data);
        return {
            rows,
            total
        };
    }, req, res);
};