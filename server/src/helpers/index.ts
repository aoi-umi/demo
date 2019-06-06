import { Request, Response, Express } from 'express';
import * as Q from 'q';
import * as moment from 'moment';
import { MongooseDocument, Error } from 'mongoose';

import * as common from '../_system/common';
import errorConfig from '../config/errorConfig';
import { logger } from '../_main';
import { ajvInst, refType } from './ajv';

type ResponseHandlerOptType = {
    json?: boolean;
    noSend?: boolean;
    sendAsFile?: boolean;
    originRes?: boolean;
}
export let responseHandler = function (fn: (opt?: ResponseHandlerOptType) => any, req: Request, res: Response, next?) {
    let opt: ResponseHandlerOptType = {
        json: true,
    }
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
            if (userAgent.indexOf('msie') >= 0 || userAgent.indexOf('chrome') >= 0) {
                res.setHeader('Content-Disposition', 'attachment; filename=' + encodeURIComponent(filename));
            } else if (userAgent.indexOf('firefox') >= 0) {
                res.setHeader('Content-Disposition', 'attachment; filename*="utf8\'\'' + encodeURIComponent(filename) + '"');
            } else {
                res.setHeader('Content-Disposition', 'attachment; filename=' + encodeURIComponent(filename));
            }
            res.end(result.fileBuff);
        }
        else {
            if (!opt.originRes) {
                result = {
                    result: true,
                    data: result,
                }
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
}

export let paramsValid = function (schema, data, opt?: { list?: boolean }) {
    opt = {
        ...opt,
    }
    //删除空
    // Object.keys(data).forEach(function (ele) {
    //     if (data[ele] === '' || data[ele] === null) {
    //         delete data[ele];
    //     }
    // });
    if (opt.list) {
        schema.properties = {
            pageIndex: { // 页码
                $ref: refType.int
            },
            rows: { // 行数
                $ref: refType.int
            },
            orderBy: { // 排序字段
                type: 'string',
            },
            sortOrder: {
                type: 'string',
                enum: ['-1', '1', ''],
            },
            ...schema.properties,
        }
        if (!data.page)
            data.page = '1';
        if (!data.rows)
            data.rows = '10';
    }
    let validator = ajvInst.compile(schema);
    let isValid = validator(data);
    if (!isValid) {
        //console.log(validator.errors);
        let list = validator.errors.map(error => {
            return error.dataPath || error.message;
        });
        throw common.error({ remark: list.join(';') }, errorConfig.ARGS_ERROR);
    }
    if (opt.list) {
        data.page = parseInt(data.page);
        data.rows = parseInt(data.rows);
        if (data.rows > 50)
            data.rows = 50;
    }
}

/**
 * mongoose数据模型验证
 */
export let mongooseValid = function (dict: { [key: string]: MongooseDocument }) {
    let list = [];
    let invaild = false;
    for (let key in dict) {
        let ele = dict[key];
        let err: any = ele.validateSync();
        if (err && err.errors) {
            invaild = true;
            let subList = [];
            for (let errorKey in err.errors) {
                let error: Error.ValidatorError = err.errors[errorKey];
                subList.push(`${error.path}`);
            }
            list.push(`[${key}] errors:` + subList.join(';'));
        }
    }
    if (invaild) {
        throw common.error({ remark: list.join('#') }, errorConfig.ARGS_ERROR);
    }
}

/**
 * mongo 日期范围匹配
 */
export let dbDateMatch = function (dateFrom, dateTo) {
    let mongoDate, sqlDate;
    if (dateFrom || dateTo) {
        mongoDate = {};
        sqlDate = {};
        if (dateFrom) {
            if (typeof dateFrom == 'string' && dateFrom.includes('T')) {
                dateFrom = new Date(dateFrom)
            }
            let from = moment(dateFrom, 'YYYY-MM-DD').toDate();

            mongoDate.$gte = from;
            // sqlDate[Op.gte] = from;
        }
        if (dateTo) {
            if (typeof dateTo == 'string' && dateTo.includes('T')) {
                dateTo = new Date(dateTo)
            }
            let to = moment(dateTo, 'YYYY-MM-DD').add({ day: 1 }).toDate();
            mongoDate.$lt = to;
            // sqlDate[Op.lt] = to;
        }
    }
    return {
        mongoDate,
        sqlDate,
    };
}