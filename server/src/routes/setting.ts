import { RequestHandler } from 'express';

import { paramsValid } from '@/helpers';
import { error, escapeRegExp } from '@/_system/common';
import * as config from '@/config';
import * as ValidSchema from '@/valid-schema/class-valid';
import { MyRequestHandler } from '@/middleware';

import { SettingMapper } from '@/models/mongo/setting';


export let detailQuery: MyRequestHandler = async (opt, req, res) => {
    let rs = await SettingMapper.detailQuery();
    return rs;
};

export let save: MyRequestHandler = async (opt, req, res) => {
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
};