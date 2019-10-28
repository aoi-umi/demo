import { RequestHandler } from 'express';

import * as config from '@/config';
import { myEnum } from '@/config';
import { responseHandler, paramsValid } from '@/helpers';
import * as ValidSchema from '@/valid-schema/class-valid';

import { GoodsMapper } from '@/models/mongo/goods';
import { error } from '@/_system/common';
import { Auth } from '@/_system/auth';

export const mgtSave: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let data = paramsValid(req.body, ValidSchema.GoodsSave);
        let user = req.myData.user;
        let rs = await GoodsMapper.mgtSave(data, { user });
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

export const mgtQuery: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let data = paramsValid(req.query, ValidSchema.GoodsQuery);
        let myData = req.myData;
        let user = myData.user;
        let { rows, total } = await GoodsMapper.query(data, {
            user,
            audit: Auth.contains(user, [config.auth.goodsMgtAudit]),
            resetOpt: {
                imgHost: myData.imgHost,
            }
        });
        return {
            rows,
            total,
        };
    }, req, res);
};