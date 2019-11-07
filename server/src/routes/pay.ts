import { RequestHandler } from 'express';

import { responseHandler, paramsValid } from '@/helpers';
import { ThirdPartyPayMapper } from '@/3rd-party';
import * as ValidSchema from '@/valid-schema/class-valid';

import { PayModel, AssetLogModel, PayMapper } from '@/models/mongo/asset';

export let create: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let user = req.myData.user;
        let data = paramsValid(req.body, ValidSchema.PayCreate);
        let payResult = await PayMapper.create(data, { user });
        return payResult;
    }, req, res);
};

export let submit: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let user = req.myData.user;
        let data = paramsValid(req.body, ValidSchema.PaySubmit);
        let pay = await PayModel.findOne({ _id: data._id, userId: user._id });
        let assetLog = await AssetLogModel.findById(pay.assetLogId);
        return {
            url: assetLog.req
        };
    }, req, res);
};

export let cancel: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let user = req.myData.user;
        let data = paramsValid(req.body, ValidSchema.PayCancel);
        return PayMapper.cancel(data, { user });
    }, req, res);
};

export let query: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let data = paramsValid(req.query, ValidSchema.PayQuery);
        let rs = await PayMapper.query(data, { user: req.myData.user, imgHost: req.myData.imgHost });
        return { rows: rs.rows, total: rs.total };
    }, req, res);
};

export let refundApply: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let user = req.myData.user;
        let data = paramsValid(req.body, ValidSchema.PayRefundApply);
        let rs = await PayMapper.refundApply(data, { user });
        return rs.pay;
    }, req, res);
};

export let refund: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let user = req.myData.user;
        let data = paramsValid(req.body, ValidSchema.PayRefund);
        let rs = await ThirdPartyPayMapper.refund({ _id: data._id });
        return rs.pay;
    }, req, res);
};