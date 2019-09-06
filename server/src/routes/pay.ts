import { RequestHandler } from 'express';

import { responseHandler, paramsValid } from '../helpers';
import { transaction } from '../_system/dbMongo';
import * as VaildSchema from '../vaild-schema/class-valid';
import { myEnum } from '../config';
import { alipayInst, ThirdPartyPayMapper } from '../3rd-party';
import { PayModel, AssetLogModel } from '../models/mongo/asset';
import { BaseMapper } from '../models/mongo/_base';
import { NotifyMapper } from '../models/mongo/notify';

export let create: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let user = req.myData.user;
        let data = paramsValid(req.body, VaildSchema.PayCreate);
        let pay = new PayModel({
            ...data,
            userId: user._id,
        });
        let { assetLog, payResult } = await ThirdPartyPayMapper.create({
            type: data.type,
            pay,
        })

        await transaction(async (session) => {
            await pay.save({ session });
            await assetLog.save({ session });
        });
        return payResult;
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

export let alipayNotify: RequestHandler = async (req, res) => {
    let data = req.body;
    let rs = await alipayInst.payNotifyHandler(data, async (notify) => {
        let notifyType = myEnum.notifyType.支付宝;
        let notifyObj = await NotifyMapper.create({ type: notifyType, value: notify, raw: data });
        await notifyObj.notify.save();

        //记录通知后马上返回，下面的方法不用await    
        ThirdPartyPayMapper.notifyHandler({ type: notifyType, notifyLog: notifyObj.notify });
    });
    res.send(rs);
};