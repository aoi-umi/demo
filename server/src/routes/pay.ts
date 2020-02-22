
import { paramsValid } from '@/helpers';
import { ThirdPartyPayMapper } from '@/3rd-party';
import * as ValidSchema from '@/valid-schema/class-valid';
import { MyRequestHandler } from '@/middleware';

import { PayModel, AssetLogModel, PayMapper } from '@/models/mongo/asset';

export let submit: MyRequestHandler = async (opt, req, res) => {
    let user = req.myData.user;
    let data = paramsValid(req.body, ValidSchema.PaySubmit);
    let pay = await PayModel.findOne({ _id: data._id, userId: user._id });
    let assetLog = await AssetLogModel.findById(pay.assetLogId);
    return {
        url: assetLog.req
    };
};

export let cancel: MyRequestHandler = async (opt, req, res) => {
    let user = req.myData.user;
    let data = paramsValid(req.body, ValidSchema.PayCancel);
    return PayMapper.cancel(data, { user });
};

export let query: MyRequestHandler = async (opt, req, res) => {
    let data = paramsValid(req.query, ValidSchema.PayQuery);
    let rs = await PayMapper.query(data, { user: req.myData.user, imgHost: req.myData.imgHost });
    return { rows: rs.rows, total: rs.total };
};

export let refundApply: MyRequestHandler = async (opt, req, res) => {
    let user = req.myData.user;
    let data = paramsValid(req.body, ValidSchema.PayRefundApply);
    let rs = await PayMapper.refundApply(data, { user });
    return rs.pay;
};

export let refund: MyRequestHandler = async (opt, req, res) => {
    let user = req.myData.user;
    let data = paramsValid(req.body, ValidSchema.PayRefund);
    let rs = await ThirdPartyPayMapper.refund({ _id: data._id });
    return rs.pay;
};