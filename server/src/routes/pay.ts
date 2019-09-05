import { RequestHandler } from 'express';

import { responseHandler, paramsValid } from '../helpers';
import * as VaildSchema from '../vaild-schema/class-valid';
import { PayModel, AssetLogModel } from '../models/mongo/asset';
import { myEnum } from '../config';
import { alipayInst } from '../3rd-party/alipay';
import { BaseMapper } from '../models/mongo/_base';
import { transaction } from '../_system/dbMongo';

export let create: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let user = req.myData.user;
        let data = paramsValid(req.body, VaildSchema.PayCreate);
        let detail = new PayModel({
            userId: user._id,
            type: data.type,
            money: data.money
        });
        let assetLog = new AssetLogModel({
            sourceType: data.type,
            orderId: detail._id,
            orderNo: detail._id,
            moneyCent: detail.moneyCent,
        });
        let rtn: {
            url?: string
        } = {};
        switch (data.type) {
            case myEnum.assetSourceType.微信:
                break;
            case myEnum.assetSourceType.支付宝:
                assetLog.req = rtn.url = alipayInst.pagePay({
                    out_trade_no: detail._id,
                    subject: 'test',
                    total_amount: detail.money,
                    body: 'test',
                });
                break;
        }
        await transaction(async (session) => {
            await detail.save({ session });
            await assetLog.save({ session });
        });
        return rtn;
    }, req, res);
};

export let query: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let data = paramsValid(req.query, VaildSchema.PayQuery);
        let rs = await PayModel.findAndCountAll({
            ...BaseMapper.getListOptions(data)
        });
        return rs;
    }, req, res);
};

export let alipayNotify: RequestHandler = (req, res) => {
    let data = req.body;
    alipayInst.payNotifyHandler(data, (notify) => {
        console.log(notify);
    });
};