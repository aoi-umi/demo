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
        let data = paramsValid(req.body, ValidSchema.GoodsMgtSave);
        let user = req.myData.user;
        let rs = await GoodsMapper.mgtSave(data, { user });
        return {
            _id: rs.spu._id
        };
    }, req, res);
};

export const mgtDetailQuery: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let data = paramsValid(req.query, ValidSchema.GoodsMgtDetailQuery);
        let myData = req.myData;
        let user = myData.user;
        let rs = await GoodsMapper.detailQuery(data);
        if (!user.equalsId(rs.spu.userId)) {
            throw error('', config.error.NO_PERMISSIONS);
        }

        let ret = rs.toJSON();
        GoodsMapper.resetDetail(ret, {
            imgHost: myData.imgHost,
            user,
        });
        return ret;
    }, req, res);
};

export const mgtQuery: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let data = paramsValid(req.query, ValidSchema.GoodsMgtQuery);
        let myData = req.myData;
        let user = myData.user;
        let { rows, total } = await GoodsMapper.query(data, {
            user,
            audit: Auth.contains(user, [config.auth.goodsMgtAudit]),
            resetOpt: {
                imgHost: myData.imgHost,
                user,
            }
        });
        return {
            rows,
            total,
        };
    }, req, res);
};

export let mgtDel: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let user = req.myData.user;
        let data = paramsValid(req.body, ValidSchema.GoodsMgtDel);
        await GoodsMapper.updateStatus({
            cond: {
                idList: data.idList,
                includeUserId: Auth.contains(user, config.auth.goodsMgtAudit) ? null : user._id,
                status: { $ne: myEnum.goodsStatus.已删除 },
            },
            toStatus: myEnum.goodsStatus.已删除, user,
        });
    }, req, res);
};

export const detailQuery: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let data = paramsValid(req.query, ValidSchema.GoodsDetailQuery);
        let myData = req.myData;
        let user = myData.user;
        let rs = await GoodsMapper.detailQuery(data, { normal: true });

        let ret = rs.toJSON();
        GoodsMapper.resetDetail(ret, {
            imgHost: myData.imgHost,
            user,
        });
        return ret;
    }, req, res);
};

export const query: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let data = paramsValid(req.query, ValidSchema.GoodsQuery);
        let myData = req.myData;
        let user = myData.user;
        let { rows, total } = await GoodsMapper.query(data, {
            user,
            normal: true,
            resetOpt: {
                imgHost: myData.imgHost,
                user,
            }
        });
        return {
            rows,
            total,
        };
    }, req, res);
};