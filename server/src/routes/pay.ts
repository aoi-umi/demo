import { RequestHandler } from 'express';

import { responseHandler, paramsValid } from '../helpers';
import { transaction } from '../_system/dbMongo';
import * as VaildSchema from '../vaild-schema/class-valid';
import { myEnum } from '../config';
import * as config from '../config';
import { alipayInst, ThirdPartyPayMapper } from '../3rd-party';
import { PayModel, AssetLogModel, PayMapper } from '../models/mongo/asset';
import { NotifyMapper } from '../models/mongo/notify';
import { error } from '../_system/common';

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
        });
        pay.assetLogId = assetLog._id;

        await transaction(async (session) => {
            await pay.save({ session });
            await assetLog.save({ session });
        });
        return payResult;
    }, req, res);
};

export let submit: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let user = req.myData.user;
        let data = paramsValid(req.body, VaildSchema.PaySubmit);
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
        let data = paramsValid(req.body, VaildSchema.PayCancel);
        let pay = await PayModel.findOne({ _id: data._id, userId: user._id });
        if (![myEnum.payStatus.未支付].includes(pay.status))
            throw error('当前状态无法取消');
        let toStatus = myEnum.payStatus.已取消;
        await pay.update({ status: toStatus });
        pay.status = toStatus;
        let obj = pay.toJSON();
        let rtn = {
            userId: obj.userId,
            status: obj.status,
            statusText: obj.statusText,
        };
        PayMapper.resetDetail(rtn, { user });
        return rtn;
    }, req, res);
};

export let query: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let data = paramsValid(req.query, VaildSchema.PayQuery);
        let rs = await PayMapper.query(data, { user: req.myData.user, imgHost: req.myData.imgHost });
        return { rows: rs.rows, total: rs.total };
    }, req, res);
};

export let alipayNotify: RequestHandler = async (req, res) => {
    let data = req.body;
    let rs = await alipayInst.payNotifyHandler({ ...data }, async (notify) => {
        let notifyType = myEnum.notifyType.支付宝;
        let notifyObj = await NotifyMapper.create({ type: notifyType, value: notify, raw: data });
        await notifyObj.notify.save();

        ThirdPartyPayMapper.sendNotifyQueue({ notifyId: notifyObj.notify._id });
    });
    res.send(rs);
};