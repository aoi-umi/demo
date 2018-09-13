import { Request, Response, Express } from 'express';
import * as common from './_system/common';
import * as myEnum from './_system/enum';
import * as auth from './_system/auth';
import { authConfig } from './_system/auth';
import * as cache from './_system/cache';
import errorConfig from './_system/errorConfig';

import * as userBll from './bll/user';

import config from '../config';

//访问权限配置
export let accessableUrlConfig: auth.AccessableUrlConfigType[] = [
    { url: '/' },
    { url: '/msg' },
    { url: '/textDiff' },
    { url: '/statistics' },
    { url: '/file', auth: [authConfig.admin] },

    { url: '/onlineUser', auth: [authConfig.login, authConfig.admin] },
    { url: '/interface/onlineUser/query', auth: [authConfig.login, authConfig.admin] },
    { url: '/interface/onlineUser/detailQuery', auth: [authConfig.login, authConfig.admin] },
    { url: '/interface/upload', auth: [authConfig.login] },

    { url: '/help', auth: [authConfig.dev] },
    { url: '/status', auth: [authConfig.dev] },
    { url: '/color', auth: [authConfig.dev] },
    { url: '/systemInfo', auth: [authConfig.login, authConfig.admin] },

    {
        url: '/log',
        auth: [
            [authConfig.dev, authConfig.admin]
        ]
    },
    { url: '/interface/log/query', auth: [authConfig.dev] },
    { url: '/interface/log/save', auth: [authConfig.local] },
    { url: '/interface/log/statistics' },

    { url: '/user/signUp' },
    { url: '/user/signIn' },
    { url: '/interface/user/signUp' },
    { url: '/interface/user/signIn' },
    { url: '/interface/user/signOut' },

    { url: '/interface/captcha/get' },

    //角色
    { url: '/role/list', auth: [authConfig.login, authConfig.admin] },
    { url: '/interface/role/query', auth: [authConfig.login, authConfig.admin] },
    { url: '/interface/role/save', auth: [authConfig.login, authConfig.admin] },
    { url: '/interface/role/detailQuery', auth: [authConfig.login, authConfig.admin] },

    //权限
    { url: '/authority/list', auth: [authConfig.admin] },
    { url: '/interface/authority/query', auth: [authConfig.admin] },
    { url: '/interface/authority/save', auth: [authConfig.admin] },
    { url: '/interface/authority/detailQuery', auth: [authConfig.admin] },

    //用户信息
    { url: '/userInfo/detail', auth: [authConfig.login] },
    { url: '/userInfo/list', auth: [authConfig.login, authConfig.admin] },
    { url: '/interface/userInfo/query', auth: [authConfig.login, authConfig.admin] },
    { url: '/interface/userInfo/detailQuery', auth: [authConfig.login, authConfig.admin] },
    { url: '/interface/userInfo/save', auth: [authConfig.login, authConfig.login] },
    { url: '/interface/userInfo/adminSave', auth: [authConfig.login, authConfig.admin] },
    { url: '/interface/userInfoLog/query', auth: [authConfig.login] },

    //mainContent
    { url: '/mainContent/list', auth: [authConfig.login, authConfig.mainContentQuery] },
    { url: '/mainContent/detail', auth: [authConfig.login, authConfig.mainContentDetailQuery] },
    { url: '/interface/mainContent/query', auth: [authConfig.login, authConfig.mainContentQuery] },
    { url: '/interface/mainContent/save', auth: [authConfig.login, authConfig.mainContentSave] },
    {
        url: '/interface/mainContent/statusUpdate',
        auth: [authConfig.login, authConfig.mainContentSave]
    },
    { url: '/interface/mainContentLog/query', auth: [authConfig.login] },

    //mainContentType
    { url: '/mainContentType/list', auth: [authConfig.login, authConfig.mainContentTypeQuery] },
    {
        url: '/interface/mainContentType/query',
        auth: [authConfig.login, authConfig.mainContentTypeQuery]
    },
    {
        url: '/interface/mainContentType/detailQuery',
        auth: [authConfig.login, authConfig.mainContentTypeDetailQuery]
    },
    {
        url: '/interface/mainContentType/save',
        auth: [authConfig.login, authConfig.mainContentTypeSave]
    },
    {
        url: '/interface/mainContentType/del',
        auth: [authConfig.login, authConfig.mainContentTypeDel]
    },

    //架构
    { url: '/struct/list', auth: [authConfig.login, authConfig.admin] },
    { url: '/interface/struct/query', auth: [authConfig.login, authConfig.admin] },
    { url: '/interface/struct/detailQuery', auth: [authConfig.login, authConfig.admin] },
    { url: '/interface/struct/save', auth: [authConfig.login, authConfig.admin] },
    { url: '/interface/struct/del', auth: [authConfig.login, authConfig.admin] },
];

//枚举
export let enumDict = {
    mainContentTypeEnum: { '0': '文章', },
    mainContentStatusEnum: { '-1': '已删除', '0': '草稿', '1': '待审核', '2': '审核中', '3': '通过', '4': '退回' },
    //添加 Operate 后缀
    mainContentStatusEnumOperate: { 'recovery': '恢复' },
    mainContentLogTypeEnum: {
        //mainConetnt
        '0': '主内容保存', '1': '主内容提交', '2': '主内容审核', '3': '主内容审核通过', '4': '主内容审核不通过', '5': '主内容删除', '6': '主内容恢复',
    },

    structTypeEnum: {
        'company': '公司', 'department': '部门', 'group': '小组',
    }
};

//枚举变更权限
export let enumChangeDict = {
    mainContentStatusEnum: {
        //初始状态
        '0': { '0': '保存', '1': '提交', '-1': '删除' },
        '1': { '2': '审核', '3': '审核通过', '4': '审核不通过', '-1': '删除' },
        '2': { '2': '审核', '3': '审核通过', '4': '审核不通过', '-1': '删除' },
        '3': { '-1': '删除' },
        '4': { '0': '保存', '1': '提交', '-1': '删除' },
        '-1': { 'recovery': '恢复' },
    }
};

export let cacheKey = {
    userInfo: 'userInfoCacheKey',
    captcha: 'captchaKey'
};

/**缓存时间 秒 */
export let cacheTime = {
    userInfo: 7 * 24 * 3600,
    captcha: 10 * 60
};

type FormatResResult = {
    result?: boolean,
    detail?: any,
    code?: string,
    desc?: string,
    guid?: string
}
export let formatRes = function (err, detail, opt) {
    //result    是否成功
    //detail    成功 返回的内容
    //          失败 错误详细
    //code      成功/失败代码
    //desc      描述
    var res: FormatResResult = {
        guid: common.guid(),
        result: true,
    };
    opt = {
        ...opt,
    }
    res.desc = opt.desc || 'success';
    res.detail = detail || null;
    res.code = opt.code;

    if (err) {
        if (!res.code && err.code)
            res.code = err.code;
        res.result = false;
        res.desc = err.message || err;
        var writeOpt: any = {
            guid: res.guid,
            url: opt.url || null
        };
        common.writeError(err, writeOpt);
    }
    return res;
};

export let formatViewRes = function (option) {
    var opt = {
        env: config.env,
        title: config.name,
        siteName: config.name,
        version: config.version,
        deploy: config.deploy,
        user: null,
        noNav: false,
    };
    opt = common.extend(opt, option);
    if (opt.env == 'dev') {
        opt.title += '[开发版]';
    }
    return opt;
};

export let init = function (opt: { viewPath: string }) {
    Date.prototype.toJSON = function () {
        return common.dateFormat(this, 'yyyy-MM-dd HH:mm:ss');
    };
    Date.prototype.toString = function () {
        return common.dateFormat(this, 'yyyy-MM-dd HH:mm:ss');
    };

    auth.init({
        accessableUrlConfig: accessableUrlConfig
    });
    myEnum.init({
        enumDict: enumDict,
        enumChangeDict: enumChangeDict,
    });
    let logSave = function (req: Request, res: Response, responseData: any) {
        var url = req.header('host') + req.originalUrl;
        var result = responseData.result;
        var logReq = req.method == 'POST' ? req.body : req.query;
        var logRes = responseData.detail;

        if (!req.myData.noLog) {
            var log = common.logModle();
            log.url = url;
            log.result = result;
            log.code = responseData.code;
            log.application = config.name;
            log.method = req._parsedUrl.pathname;
            log.methodName = req.myData.method.methodName || log.method;
            log.req = logReq;
            log.res = logRes;
            log.ip = req.myData.ip;
            log.remark = responseData.desc + `[${req.method}][account:${req.myData.user.account}]`;
            log.guid = responseData.guid;
            log.duration = new Date().getTime() - req.myData.startTime;
            common.logSave(log);
        }
    }
    let myRender = function (req: Request, res: Response, view, options) {
        let opt = {
            user: req.myData.user,
            noNav: req.myData.noNav,
            isHadAuthority: function (authData) {
                return auth.isHadAuthority(req.myData.user, authData);
            },
            authConfig: authConfig,
            accessableUrl: req.myData.accessableUrl,
            guid: common.guid(),
        };
        opt = common.extend(opt, options);
        let formatResResult = formatViewRes(opt) as any;
        res.render(view, formatResResult);
        let error = formatResResult.error;
        logSave(req, res, {
            result: !error,
            detail: error || (`${view}${formatResResult.view ? '[' + formatResResult.view + ']' : ''}`),
            code: (error && error.code) || '',
            desc: '',
            guid: formatResResult.guid
        });
    };
    let mySend = function (req: Request, res: Response, err, detail, option) {
        let opt = {
            url: req.header('host') + req.originalUrl
        };
        opt = common.extend(opt, option);
        let formatResResult = formatRes(err, detail, opt);
        if (req.myData.useStatus && err && err.status)
            res.status(err.status);
        res.send(formatResResult);
        logSave(req, res, formatResResult);
    };
    return function (req: Request, res: Response, next) {
        //req.query  /?params1=1&params2=2
        //req.body  post的参数
        //req.params /:params1/:params2
        //console.log(require('./routes/_system/common').getClientIp(req));

        // console.log(__dirname);
        // console.log(__filename);
        // console.log(process.cwd());
        // console.log(path.resolve('./'));
        req.myData = {
            method: {},
            user: {
                id: 0,
                nickname: '',
                account: '#guest',
                authority: {}
            },
            viewPath: opt.viewPath,
            startTime: new Date().getTime(),
            accessableUrl: {},
            ip: common.getClientIp(req),
        };
        var user = req.myData.user;
        req.myData.noNav = common.parseBool(req.query.noNav);
        req.myData.useStatus = common.parseBool(req.query.useStatus);
        if (req.query.lang)
            req.myData.lang = req.query.lang;

        if (/^(::ffff:)?(127\.0\.0\.1)$/.test(req.myData.ip))
            user.authority[authConfig.local.code] = true;
        if (config.env == 'dev')
            user.authority[authConfig.dev.code] = true;

        if (req._parsedUrl.pathname == '/interface/log/save') {
            req.body.requestIp = req.myData.ip;
        }
        if (common.isInArray(req._parsedUrl.pathname, ['/interface/log/save', '/log', '/interface/captcha/get'])) {
            req.myData.noLog = true;
        }

        res.myRender = function (view, options) {
            myRender(req, res, view, options);
        };

        res.mySend = function (err, detail, opt) {
            mySend(req, res, err, detail, opt);
        };

        var userInfoKey = req.cookies[cacheKey.userInfo];
        common.promise(async () => {
            if (!userInfoKey)
                return;
            userInfoKey = cacheKey.userInfo + userInfoKey;
            let userCache = await cache.get(userInfoKey);
            if (!userCache)
                return;
            userCache.key = userInfoKey;
            req.myData.user = userCache;
            if (userCache.cacheDatetime && new Date().getTime() - new Date(userCache.cacheDatetime).getTime() < 12 * 3600 * 1000)
                return;
            //region 自动重新登录获取信息
            req.myData.autoSignIn = true;
            await userBll.signInInside(req).fail(async function (e) {
                //登录失败以下错误直接抛出，否则先删除缓存
                if (common.isInArray(e.code, [errorConfig.DB_ERROR.code]))
                    throw e;
                await cache.del(userInfoKey)
                throw common.error('请重新登录！', e.code);
            });
            req.myData.autoSignIn = false;
            //endregion
        }).then(function () {
            next();
        }).fail(function (e) {
            next(e);
        });
    };
};

import * as index from './module/index';
import * as upload from './upload';
import * as _interface from '././module/_interface';
import * as _view from '././module/_view';
//注册路由
export let register = function (app: Express) {
    app.get('/msg', index.msg);
    app.post('/interface/upload', upload.anyFile, index.upload);
    app.post('/interface/captcha/get', index.captchaGet);
    app.post(/\/interface\/([\s\S]+)\/([\s\S]+)/, _interface.post);
    app.get('*', _view.get);
}

export let errorHandler = function (err, req: Request, res: Response, next) {
    common.writeError(err);
    if (typeof err !== 'object')
        err = new Error(err);
    if (config.env !== 'dev') {
        err.stack = '';
    }
    err.status = err.status || 500;
    err.code = err.code || err.status;
    if (req.xhr) {
        return res.mySend(err, err);
    }
    if (errorConfig.NO_LOGIN.code == err.code) {
        var signIn = `/user/signIn?noNav=${req.myData.noNav}&toUrl=${encodeURIComponent(req.url)}`;
        return res.redirect(signIn);
    }
    res.status(err.status);
    res.myRender('view', {
        view: 'error',
        title: '出错了',
        message: err.message,
        error: err
    });
};