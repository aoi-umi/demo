import { Request, Response, Express } from 'express';
import * as Q from 'q';
import * as Ajv from 'ajv';
let ajv = new Ajv({ allErrors: true });

export let patterns = {
    price: '(^[1-9]\\d*(\\.\\d{1,2})?$)|(^0(\\.\\d{1,2})?$)', // 价格， 保留2位小数
    int: '(^[1-9]\\d*$)|(^0$)',
    objId: '^[0-9a-z]{24}$', // ObjectId 字符串
    // YYYY-MM-DD 日期
    date: '^(?:(?!0000)[0-9]{4}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)|(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00)-02-29)$',
    // YYYY-MM-DD HH:mm:ss
    datetime: '^(?:(?!0000)[0-9]{4}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)|(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00)-02-29)\\s(([0-1][0-9])|([2][0-3])):([0-5][0-9]):([0-5][0-9])$',
    vin: '^[0-9A-HJ-NPR-Z]{17}$',
    statementNo: '^[0-9]{20}$', // 结算单编号
    mobile: '^1[1-9][0-9]{9}$',  // 手机号
    telphone: '(^\\+?[0-9]{3,4}-?[0-9]{7,8}$)|(^\\+?[0-9]{2}-?1[1-9]{1}[0-9]{9}$)',  // 手机号 + 电话  (1(([35][0-9])|(47)|[8][01236789]))[0-9]{8}
    validationCode: '^[0-9]{4,6}$',  // 验证码
    password: '^[\\w]{6,16}$',
    licenseNo: '^[0-9]{1,15}$',  // 道路运输经营许可证
    socialCode: '^[0-9A-Z]{15}([0-9A-Z]{3})?$', // 营业执照
    adminCode: '^[0-9]{6}$',
    // plateNo: '[^' + PROVINCEABBR.join('') + ']' + '[A-Z0-9]{4,5}[A-Z0-9挂学警港澳]$',
    // unit: '^[' + Object.values(UNITS).join('') + ']{1}$',
    categoryCode: '^[A-Z]+$',
    categoryCodeOrEmpty: '^[A-Z]*$',
    discount: '(^0\\.[0-9]{1,4}$)|(^0$)|(^1\\.0{1,4}$)|(^1$)', //折扣 0-1之间的两位小数
    //stockOutType: '^[' + Object.keys(settings.STOCKOUTTYPE).join('') + ']{1}$', // 出库类型
    email: '^[\\w.\\-]+@(?:[a-z0-9]+(?:-[a-z0-9]+)*\\.)+[a-z]{2,3}$',
    code: '(?:(?!0000)[0-9]{4}(?:(?:0[1-9]|1[0-2])(?:0[1-9]|1[0-9]|2[0-8])|(?:0[13-9]|1[0-2])(?:29|30)|(?:0[13578]|1[02])31)|(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00)0229)' + '[0-9]{4}$'
}
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
        //log.result = true;
        if (!['401', '403'].includes(err.code))
            console.error(err);
        let msg = err.msg || err.message;
        // if (!msg && err.code) {
        //     let match = codeList.find(ele => ele.code == err.code);
        //     if (match)
        //         msg = match.msg;
        // }
        let response = { code: err.code || '507000', msg: msg, remark: err.remark };
        // if (!['401', '403', '107003'].includes(err.code)) {
        //     log.code = response.code;
        //     log.response = response;
        // }
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
                type: "string",
                pattern: patterns.int,
            },
            rows: { // 行数
                type: "string",
                pattern: patterns.int,
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
    let validator = ajv.compile(schema);
    let isValid = validator(data);
    if (!isValid) {
        //console.log(validator.errors);
        let list = validator.errors.map(error => {
            return error.dataPath || error.message;
        });
        throw { code: '107003', remark: list.join(';') };
    }
    if (opt.list) {
        data.page = parseInt(data.page);
        data.rows = parseInt(data.rows);
        if (data.rows > 50)
            data.rows = 50;
    }
}