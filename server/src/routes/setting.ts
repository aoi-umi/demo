import { RequestHandler } from 'express';

import { responseHandler, paramsValid } from '@/helpers';
import { error, escapeRegExp } from '@/_system/common';
import * as config from '@/config';
import * as ValidSchema from '@/valid-schema/class-valid';
import { SettingMapper } from '@/models/mongo/setting';


export let detailQuery: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let rs = await SettingMapper.detailQuery();
        return rs;
    }, req, res);
};

export let save: RequestHandler = (req, res) => {
    responseHandler(async () => {
        let user = req.myData.user;
        let data = req.body;
        let detail = await SettingMapper.detailQuery();
        ['signUpType', 'signUpFrom', 'signUpTo'].forEach(key => {
            detail[key] = data[key];
        });
        detail.operatorId = user._id;
        await detail.save();
        return {
            _id: detail._id,
        };
    }, req, res);
};