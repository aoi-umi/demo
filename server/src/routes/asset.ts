import { RequestHandler } from 'express';

import { responseHandler, paramsValid } from '@/helpers';
import * as ValidSchema from '@/valid-schema/class-valid';
import { ThirdPartyPayMapper } from '@/3rd-party';

import { NotifyMapper } from '@/models/mongo/notify';
import { AssetLogMapper } from '@/models/mongo/asset';

export const notifyQuery: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let data = paramsValid(req.query, ValidSchema.AssetNotifyQuery);
        let { rows, total } = await NotifyMapper.query(data);
        return {
            rows,
            total
        };
    }, req, res);
};

export const notifyRetry: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let data = paramsValid(req.body, ValidSchema.AssetNotifyRetry);
        await ThirdPartyPayMapper.notifyHandler({ notifyId: data._id });
    }, req, res);
}

export const logQuery: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let data = paramsValid(req.query, ValidSchema.AssetLogQuery);

        let { rows, total } = await AssetLogMapper.query(data);
        return {
            rows,
            total
        };
    }, req, res);
};