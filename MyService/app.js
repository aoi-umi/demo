var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var config = require('./config');

var common = require('./routes/_system/common');
var main = require('./routes/_system/_main');
var auth = require('./routes/_system/auth');
var errorConfig = require('./routes/_system/errorConfig');
var cache = require('./routes/_system/cache');

var sign = require('./routes/bll/sign');

var app = express();
console.log(config.name, 'run at port ', config.port, ',version:', config.version);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//初始化
main.init();

var myRender = function (req, res, view, options) {
    var opt = {
        user: req.myData.user,
        noNav: req.myData.noNav,
        isHadAuthority: function (authData) {
            return auth.isHadAuthority(req.myData.user, authData);
        },
        accessableUrl: req.myData.accessableUrl,
    };
    opt = common.extend(opt, options);
    res.render(view, common.formatViewtRes(opt));
};
var mySend = function (req, res, err, detail, option) {
    var url = req.header('host') + req.originalUrl;
    var opt = {
        url: url,
    };
    opt = common.extend(opt, option);
    var formatRes = common.formatRes(err, detail, opt);
    if (req.myData.useStatus && err && err.status)
        res.status(err.status);
    res.send(formatRes);
    var result = formatRes.result;
    var logReq = req.method == 'POST' ? req.body : '';
    var logRes = formatRes.detail;
    var logMethod = '[' + (config.name + '][' + (req.myData.method.methodName || req.originalUrl)) + ']';

    if (!req.myData.noLog) {
        var log = common.logModle();
        log.url = url;
        log.result = result;
        log.code = formatRes.code;
        log.method = logMethod
        log.req = logReq;
        log.res = logRes;
        log.ip = req.myData.ip;
        log.remark = formatRes.desc + `[account:${req.myData.user.account}]`;
        log.guid = formatRes.guid;
        log.duration = new Date().getTime() - req.myData.startTime;
        common.logSave(log);
    }
};
app.use(function (req, res, next) {
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
            nickname: 'guest',
            account: '#guest',
            authority: {}
        },
        viewPath: app.get('views'),
        startTime: new Date().getTime(),
        accessableUrl: [],
        ip: common.getClientIp(req),
    };
    var user = req.myData.user;
    req.myData.noNav = common.parseBool(req.query.noNav);
    req.myData.useStatus = common.parseBool(req.query.useStatus);

    if (req.myData.ip == '::ffff:127.0.0.1')
        user.authority['local'] = true;

    if (req._parsedUrl.pathname == '/interface/log/save') {
        req.myData.noLog = true;
    }
    if (config.env == 'dev')
        user.authority['dev'] = true;

    res.myRender = function (view, options) {
        myRender(req, res, view, options);
    };

    res.mySend = function (err, detail, opt) {
        mySend(req, res, err, detail, opt)
    };

    var userInfoKey = req.cookies[config.cacheKey.userInfo];
    if (userInfoKey) {
        userInfoKey = config.cacheKey.userInfo + userInfoKey;
        cache.get(userInfoKey).then(function (t) {
                if (t) {
                    t.key = userInfoKey;
                    req.myData.user = t;
                    //自动重新登录获取信息
                    if (!t.cacheDatetime || new Date() - new Date(t.cacheDatetime) > 12 * 3600 * 1000) {
                        req.myData.autoSignIn = true;
                        return common.promise().then(function (promiseRes) {
                            sign.inInside(req).then(promiseRes.resolve).fail(function (e) {
                                //console.log(e);
                                cache.del(userInfoKey).then(function () {
                                    throw common.error('请重新登录！');
                                }).fail(promiseRes.reject);
                            });
                            return promiseRes.promise;
                        });
                    }
                }
            }
        ).then(function () {
            req.myData.autoSignIn = false;
            next();
        }).fail(function (e) {
            next(e);
        });
    } else {
        next();
    }
});

//按restConfig 注册路由
var restList = [];
main.restConfig.forEach(function (rest) {
    var method = rest.method;
    var path = rest.path || rest.url;
    if (path && path.substr(0, 1) !== '/')
        path = '/' + path;
    path = './routes' + path;
    var isRouter = true;
    if (!method)
        method = 'post';
    var functionName = rest.functionName || method;
    var routerMethodList = [];

    function init(req, res, next) {
        auth.auth(req, res, next);
    }

    routerMethodList.push(init);

    var reqfile = require(path);
    var reqFun = reqfile[functionName];
    if (!reqFun)
        throw common.error(`[${path}] is not exist function [${functionName}]`, errorConfig.CODE_ERROR.code);

    var createFun = function (fun) {
        return function (req, res, next) {
            req.myData.method = {methodName: rest.methodName};
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
            app[methodName](rest.url, routerMethodList);
            break;
        default:
            isRouter = false;
            break;
    }
    if (isRouter) {
        restList.push({url: rest.url, functionName: functionName, path: path});
    }
});
//console.log(restList);

/// catch 404 and forwarding to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

app.use(function (err, req, res, next) {
    common.writeError(err);
    if (config.env !== 'dev') {
        err.stack = '';
    }
    err.status = err.status || 500;
    err.code = err.code || err.status;
    var xRequestedWith = req.header('x-requested-with');
    if (xRequestedWith && xRequestedWith.toLowerCase() == 'xmlhttprequest') {
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
});

process.on('unhandledRejection', function (e) {
    console.error('unhandledRejection');
    common.writeError(e);
});

module.exports = app;
