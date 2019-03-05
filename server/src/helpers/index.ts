import { Request, Response, Express } from 'express';
import * as Q from 'q';
import { ajvInst, refType } from './ajv';
import { errorConfig } from '../lang/zh';

type ResponseHandlerOptType = {
    json?: boolean;
    noSend?: boolean;
    sendAsFile?: boolean;
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
            res.json(result);
            //log.response = result;
        }
    }).catch(err => {
        let msg = err.msg || err.message;
        let response = { result: false, code: err.code, msg, remark: err.remark };
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
    Object.keys(data).forEach(function (ele) {
        if (data[ele] === '' || data[ele] === null) {
            delete data[ele];
        }
    });
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
        throw { result: false, code: errorConfig.ARGS_ERROR, remark: list.join(';') };
    }
    if (opt.list) {
        data.page = parseInt(data.page);
        data.rows = parseInt(data.rows);
        if (data.rows > 50)
            data.rows = 50;
    }
}