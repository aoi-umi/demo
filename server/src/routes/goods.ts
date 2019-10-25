import { RequestHandler } from 'express';

import * as config from '@/config';
import { responseHandler, paramsValid } from '@/helpers';
import * as ValidSchema from '@/valid-schema/class-valid';

import { GoodsMapper } from '@/models/mongo/goods';
import { error } from '@/_system/common';

export const mgtSave: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let data = paramsValid(req.body, ValidSchema.GoodsSave);
        let user = req.myData.user;
        let rs = await GoodsMapper.save(data, { user });
        return {
            _id: rs.spu._id
        };
    }, req, res);
};

export const mgtDetailQuery: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let data = paramsValid(req.query, ValidSchema.GoodsDetailQuery);
        let user = req.myData.user;
        let rs = await GoodsMapper.detailQuery(data);
        if (!user._id.equals(rs.spu.userId)) {
            throw error('', config.error.NO_PERMISSIONS);
        }
        return rs;
    }, req, res);
};