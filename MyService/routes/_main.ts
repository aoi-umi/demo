import * as express from 'express';
import * as common from './_system/common';
import * as myEnum from './_system/enum';
import * as auth from './_system/auth';
import * as cache from './_system/cache';
import errorConfig from './_system/errorConfig';

import * as sign from './bll/sign';
import myMulter from './_system/myMulter';

import config from '../config';

type RouteConfig = {
    url: string | RegExp,
    method: string,
    functionName?: string,//为空时按method
    methodName?: string,//用于记录日志
    path?: string,//为空时则按url
    middleware?: any[]
}
//路由配置 文件必须在routes目录下
export let routeConfig: RouteConfig[] = [
    {
        url: /\/interface\/([\s\S]+)\/([\s\S]+)/,
        method: 'post',
        methodName: 'module-method',
        path: '/module/_interface',
    },
    {
        url: '*',
        method: 'get',
        methodName: 'module-view',
        path: '/module/_view',
    }
];

//访问权限配置
export let accessableUrlConfig = [
    {url: '/'},
    {url: '/msg'},
    {url: '/textDiff'},

    {url: '/onlineUser', auth: ['admin']},
    {url: '/interface/onlineUser/query', auth: ['admin']},
    {url: '/interface/onlineUser/detailQuery', auth: ['admin']},
    {url: '/interface/upload', auth: ['login']},
    {url: '/help', auth: ['dev']},
    {url: '/status', auth: ['dev']},
    {url: '/color', auth: ['dev']},

    {url: '/log', auth: ['dev']},
    {url: '/interface/log/query', auth: ['dev']},
    {url: '/interface/log/save', auth: ['local']},

    {url: '/sign/up'},
    {url: '/sign/in'},
    {url: '/interface/sign/up'},
    {url: '/interface/sign/in'},
    {url: '/interface/sign/out'},

    //角色
    {url: '/role/list', auth: ['admin']},
    {url: '/interface/role/query', auth: ['admin']},
    {url: '/interface/role/save', auth: ['admin']},
    {url: '/interface/role/detailQuery', auth: ['admin']},

    //权限
    {url: '/authority/list', auth: ['admin']},
    {url: '/interface/authority/query', auth: ['admin']},
    {url: '/interface/authority/save', auth: ['admin']},
    {url: '/interface/authority/detailQuery', auth: ['admin']},

    //用户信息
    {url: '/userInfo/detail', auth: ['login']},
    {url: '/userInfo/list', auth: ['admin']},
    {url: '/interface/userInfo/query', auth: ['admin']},
    {url: '/interface/userInfo/detailQuery', auth: ['admin']},
    {url: '/interface/userInfo/save', auth: ['login']},
    {url: '/interface/userInfo/adminSave', auth: ['admin']},

    {url: '/mainContent/list', auth: ['mainContentQuery']},
    {url: '/mainContent/detail', auth: ['mainContentTypeDetailQuery']},
    {url: '/interface/mainContent/query', auth: ['mainContentQuery']},
    {url: '/interface/mainContent/save', auth: ['mainContentSave']},
    {url: '/interface/mainContent/statusUpdate', auth: ['mainContentSave']},
    //{url: '/interface/mainContent/del', auth: ['admin']},

    {url: '/mainContentType/list', auth: ['mainContentTypeQuery']},
    {url: '/interface/mainContentType/query', auth: ['mainContentTypeQuery']},
    {url: '/interface/mainContentType/detailQuery', auth: ['mainContentTypeDetailQuery']},
    {url: '/interface/mainContentType/save', auth: ['mainContentTypeSave']},
    {url: '/interface/mainContentType/del', auth: ['mainContentTypeDel']},

    {url: '/struct/list', auth: ['admin']},
    {url: '/interface/struct/query', auth: ['admin']},
    {url: '/interface/struct/detailQuery', auth: ['admin']},
    {url: '/interface/struct/save', auth: ['admin']},
    {url: '/interface/struct/del', auth: ['admin']},
];

//枚举
export let enumDict = {
    mainContentTypeEnum: {'0': '文章',},
    mainContentStatusEnum: {'-1': '已删除', '0': '草稿', '1': '待审核', '2': '审核中', '3': '通过', '4': '退回'},
    //添加 Operate 后缀
    mainContentStatusEnumOperate: {'recovery': '恢复'},
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
        '0': {'0': '保存', '1': '提交', '-1': '删除'},
        '1': {'2': '审核', '3': '审核通过', '4': '审核不通过', '-1': '删除'},
        '2': {'2': '审核', '3': '审核通过', '4': '审核不通过', '-1': '删除'},
        '3': {'-1': '删除'},
        '4': {'0': '保存', '1': '提交', '-1': '删除'},
        '-1': {'recovery': '恢复'},
    }
};

export let cacheKey = {
    userInfo: 'userInfoCacheKey'
};

/**缓存时间 秒 */
export let cacheTime = {
    userInfo: 7 * 24 * 3600
};

export let formatRes = function (err, detail, opt) {
    //result    是否成功
    //detail    成功 返回的内容
    //          失败 错误详细
    //code      成功/失败代码
    //desc      描述
    var res = {
        result: null,
        detail: null,
        code: null,
        desc: null,
        guid: common.guid()
    };
    var url = '';
    if (opt) {
        if (opt.code)
            res.code = opt.code;
        if (opt.desc)
            res.desc = opt.desc;
        if (opt.url)
            url = opt.url;
    }
    if (err) {
        if (err.code)
            res.code = err.code;
        var writeOpt: any = {
            guid: res.guid
        };
        if (url)
            writeOpt.url = url;
        common.writeError(err, writeOpt);
        var errMsg = err;
        if (err.message) errMsg = err.message;
        res.result = false;
        res.desc = errMsg;
    } else {
        res.result = true;
        if (!res.desc)
            res.desc = 'success';
    }
    if (detail)
        res.detail = detail;
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

export let init = function (opt) {
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

    let myRender = function (req: express.Request, res: express.Response, view, options) {
        var opt = {
            user: req.myData.user,
            noNav: req.myData.noNav,
            isHadAuthority: function (authData) {
                return auth.isHadAuthority(req.myData.user, authData);
            },
            accessableUrl: req.myData.accessableUrl,
        };
        opt = common.extend(opt, options);
        res.render(view, formatViewRes(opt));
    };
    let mySend = function (req: express.Request, res: express.Response, err, detail, option) {
        var url = req.header('host') + req.originalUrl;
        var opt = {
            url: url,
        };
        opt = common.extend(opt, option);
        var formatResResult = formatRes(err, detail, opt);
        if (req.myData.useStatus && err && err.status)
            res.status(err.status);
        res.send(formatResResult);
        var result = formatResResult.result;
        var logReq = req.method == 'POST' ? req.body : '';
        var logRes = formatResResult.detail;
        var logMethod = '[' + (config.name + '][' + (req.myData.method.methodName || req.originalUrl)) + ']';

        if (!req.myData.noLog) {
            var log = common.logModle();
            log.url = url;
            log.result = result;
            log.code = formatResResult.code;
            log.method = logMethod
            log.req = logReq;
            log.res = logRes;
            log.ip = req.myData.ip;
            log.remark = formatResResult.desc + `[account:${req.myData.user.account}]`;
            log.guid = formatResResult.guid;
            log.duration = new Date().getTime() - req.myData.startTime;
            common.logSave(log);
        }
    };
    return function (req: express.Request, res: express.Response, next) {
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

        if (/^(::ffff:)?(127\.0\.0\.1)$/.test(req.myData.ip))
            user.authority['local'] = true;

        if (req['_parsedUrl'].pathname == '/interface/log/save') {
            req.myData.noLog = true;
        }
        if (config.env == 'dev')
            user.authority['dev'] = true;

        res.myRender = function (view, options) {
            myRender(req, res, view, options);
        };

        res.mySend = function (err, detail, opt) {
            mySend(req, res, err, detail, opt);
        };

        var userInfoKey = req.cookies[cacheKey.userInfo];
        if (userInfoKey) {
            userInfoKey = cacheKey.userInfo + userInfoKey;
            cache.get(userInfoKey).then(function (t) {
                if (t) {
                    t.key = userInfoKey;
                    req.myData.user = t;
                    //自动重新登录获取信息
                    if (!t.cacheDatetime || new Date().getTime() - new Date(t.cacheDatetime).getTime() > 12 * 3600) {
                        req.myData.autoSignIn = true;
                        return common.promise(function (defer) {
                            sign.inInside(req).then(defer.resolve).fail(function (e) {
                                //console.log(e);
                                cache.del(userInfoKey).then(function () {
                                    throw common.error('请重新登录！');
                                }).fail(defer.reject);
                            });
                            return defer.promise;
                        });
                    }
                }
            }).then(function () {
                req.myData.autoSignIn = false;
                next();
            }).fail(function (e) {
                next(e);
            });
        } else {
            next();
        }
    };
};

//注册路由
export let routes = express();
routes.get('/msg', require('./index').msg);
routes.post('/interface/upload', myMulter.any(), require('./index').upload);

//按配置注册路由
export let register = function (app, routeConfig: RouteConfig[]) {
    var routeList = [];
    routeConfig.forEach(function (route) {
        var method = route.method;
        var path = (route.path || route.url) as string;
        if (path && path.substr(0, 1) !== '/')
            path = '/' + path;
        path = '.' + path;
        var isRouter = true;
        if (!method)
            method = 'post';
        var functionName = route.functionName || method;
        var routerMethodList = [];

        //中间件
        if (route.middleware)
            routerMethodList = routerMethodList.concat(route.middleware);

        let reqfile = require(path);
        var reqFun = reqfile[functionName];
        if (!reqFun)
            throw common.error(`[${path}] is not exist function [${functionName}]`, errorConfig.CODE_ERROR);

        var createFun = function (fun) {
            return function (req: express.Request, res: express.Response, next) {
                req.myData.method = {methodName: route.methodName};
                try {
                    fun(req, res, next);
                } catch (e) {
                    next(e);
                }
            };
        };
        if (reqFun instanceof Array) {
            reqFun.forEach(function (fun) {
                var methodFun = createFun(fun);
                routerMethodList.push(methodFun);
            });
        } else {
            var methodFun = createFun(reqFun);
            routerMethodList.push(methodFun);
        }

        var methodName = method.toLowerCase();
        switch (methodName) {
            case 'get':
            case 'post':
                app[methodName](route.url, routerMethodList);
                break;
            default:
                isRouter = false;
                break;
        }
        if (isRouter) {
            routeList.push({url: route.url, functionName: functionName, path: path});
        }
    });
    //console.log(routeList);
};

export let errorHandler = function (err, req: express.Request, res: express.Response, next) {
    common.writeError(err);
    if (typeof err !== 'object')
        err = new Error(err);
    if (config.env !== 'dev') {
        err.stack = '';
    }
    err.status = err.status || 500;
    err.code = err.code || err.status;
    var method = req.method;
    if (method && method.toLowerCase() == 'post') {
        res.mySend(err, err, {code: err.code});
    } else {
        if (errorConfig.NO_LOGIN.code == err.code) {
            var signIn = '/sign/in?noNav=' + req.myData.noNav;
            res.redirect(signIn);
        }
        else {
            res.status(err.status);
            res.myRender('view', {
                view: 'error',
                title: '出错了',
                message: err.message,
                error: err
            });
        }
    }
};