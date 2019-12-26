import { Request, Response, NextFunction } from 'express';
import * as Q from 'q';
import * as moment from 'dayjs';
import { MongooseDocument, Error } from 'mongoose';
import { ClassType } from 'class-transformer/ClassTransformer';
import { plainToClass } from 'class-transformer';
import { configure, getLogger } from 'log4js';

import * as common from '../_system/common';
import * as config from '../config';
import * as ValidSchema from '../valid-schema/class-valid';
import { valid } from './class-valid';

export const logger = getLogger();

let appenders = {};
appenders[config.env.logger.name] = config.env.logger.appenders;

configure({
    appenders,
    categories: {
        default: {
            appenders: [config.env.logger.name],
            level: 'info'
        }
    }
});

type MyRequestHandlerOpt = {
    json?: boolean;
    noSend?: boolean;
    sendAsFile?: boolean;
    originRes?: boolean;
}
export let myRequestHandler = function (fn: (opt?: MyRequestHandlerOpt) => any, req: Request, res: Response, next?) {
    let opt: MyRequestHandlerOpt = {
        json: true,
    };
    //let log = helpers.expressCreateLog(req, res);
    return Q.fcall(() => {
        return fn(opt);
    }).then(result => {
        //fn中自行处理
        if (opt.noSend)
            return result;
        //result = {fileBuff, filename}
        if (opt.sendAsFile) {
            let filename = result.filename || '未命名';
            let userAgent = (req.headers['user-agent'] || '').toLowerCase();
            res.setHeader('Content-Type', "application/octet-stream");
            let encodeName = encodeURIComponent(filename);
            let disposition = 'attachment; filename=' + encodeName;
            if (userAgent.indexOf('firefox') >= 0) {
                disposition = `attachment; filename*="utf8''${encodeName}"`;
            }
            res.setHeader('Content-Disposition', disposition);
            res.end(result.fileBuff);
        }
        else {
            if (!opt.originRes) {
                result = {
                    result: true,
                    data: result,
                };
            }
            res.json(result);
            //log.response = result;
        }
    }).catch(err => {
        let msg = err.msg || err.message;
        let response = { result: false, code: err.code, msg, remark: err.remark };
        logger.error(err);
        res.json(response);
    }).finally(() => {
        // if (log.response)
        //     new LogModel(log).save();
    });
};

/**
 * 数据校验
 * @param data 已经转换了的数据，如果未转换，传入schema
 * @param schema 
 */
export function paramsValid<T>(data: T): T;
export function paramsValid<T>(data, schema: ClassType<T>): T;
export function paramsValid(data, schema?) {
    let rtnData = schema ? plainToClass(schema, data) : data;
    // console.log(rtnData);
    let err = valid(rtnData);
    if (err.length) {
        logger.info(JSON.stringify(rtnData));
        throw common.error('', config.error.ARGS_ERROR, { remark: err.join(';') });
    }

    if (rtnData instanceof ValidSchema.ListBase) {
        if (!rtnData.page)
            rtnData.page = 1;
        if (!rtnData.rows)
            rtnData.rows = 10;

        let maxRows = 100;
        if (rtnData.rows > maxRows)
            rtnData.rows = maxRows;
    }
    return rtnData;
}

/**
 * mongoose数据模型验证
 */
export let mongooseValid = function (dict: { [key: string]: MongooseDocument }) {
    let list = [];
    let invalid = false;
    for (let key in dict) {
        let ele = dict[key];
        let err: any = ele.validateSync();
        if (err && err.errors) {
            invalid = true;
            let subList = [];
            for (let errorKey in err.errors) {
                let error: Error.ValidatorError = err.errors[errorKey];
                subList.push(`${error.path}`);
            }
            list.push(`[${key}] errors:` + subList.join(';'));
        }
    }
    if (invalid) {
        throw common.error({ remark: list.join('#') }, config.error.ARGS_ERROR);
    }
};

/**
 * mongo 日期范围匹配
 */
export let dbDateMatch = function (dateFrom, dateTo) {
    let mongoDate, sqlDate;
    if (dateFrom || dateTo) {
        mongoDate = {};
        sqlDate = {};
        function convertDate(d) {
            if (typeof d == 'string' && d.includes('T')) {
                d = new Date(d);
            }
            return moment(d, 'YYYY-MM-DD').toDate();
        }
        if (dateFrom) {
            let from = convertDate(dateFrom);

            mongoDate.$gte = from;
            // sqlDate[Op.gte] = from;
        }
        if (dateTo) {
            let to = convertDate(dateTo);
            mongoDate.$lt = to;
            // sqlDate[Op.lt] = to;
        }
    }
    return {
        mongoDate,
        sqlDate,
    };
};

export let tryFn = function (fn) {
    try {
        fn();
    } catch (e) {
        console.error('出错了', e);
    }
};