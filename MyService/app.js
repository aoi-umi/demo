var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var config = require('./config');
var common = require('./routes/_system/common');
var cache = require('./routes/_system/cache');
var app = express();
console.log(config.name,'run at port ', config.port, ',version:', config.version);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//init
Date.prototype.toJSON = function() {
    return common.dateFormat(this, 'yyyy-MM-dd HH:mm:ss');
};
Date.prototype.toString = function() {
    return common.dateFormat(this, 'yyyy-MM-dd HH:mm:ss');
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
            nickname: 'guest',
            authority: {}
        },
        viewPath: app.get('views')
    };
    var user = req.myData.user;
    if(config.env == 'dev')
        user.authority['dev'] = true;

    res.myRender = function (view, options, fn) {
        var opt = {
            user: req.myData.user,
            noNav: req.query.noNav,
        };
        if (opt.noNav && opt.noNav.toString().toLowerCase() == 'false')
            opt.noNav = false;
        opt = common.extend(opt, options);
        res.render(view, common.formatViewtRes(opt));
    };

    var startTime = new Date().getTime();
    res.mySend = function (err, detail, opt) {
        var formatRes = common.formatRes(err, detail, opt);
        res.send(formatRes);
        var url = req.originalUrl;
        var result = formatRes.result;
        var logReq = req.method == 'POST' ? req.body : '';
        var logRes = formatRes.detail;
        var logMethod = '[' + (config.name + '][' + (req.myData.method.methodName || url)) + ']';

        url = req.header('host') + url;
        if(!req.myData.noLog) {
            var log = common.logModle();
            log.url = url;
            log.result = result;
            log.code = formatRes.code;
            log.method = logMethod
            log.req = logReq;
            log.res = logRes;
            log.ip = common.getClientIp(req);
            log.remark = formatRes.desc;
            log.guid = formatRes.guid;
            log.duration = new Date().getTime() - startTime;
            common.logSave(log);
        }
    };

    var userInfoKey = req.cookies[config.cacheKey.userInfo];
    if (userInfoKey) {
        userInfoKey = config.cacheKey.userInfo + userInfoKey;
        cache.getPromise(userInfoKey).then(function (t) {
            if (t) {
                req.myData.user = t;
            }
            next();
        }).catch(function (e) {
            next(e);
        });
    } else {
        next();
    }
});

var auth = require('./routes/_system/auth');
var restConfig = require('./rest_config');
var restList = [];
restConfig.forEach(function(rest) {
    var method = rest.method;
    var path = rest.path || rest.url;
    if (path && path.substr(0, 1) !== '/')
        path = '/' + path;
    path = './routes' + path;
    var isRouter = true;
    if(!method)
        method = 'post';
    var functionName = rest.functionName || method;
    var routerMethodList = [];

    function init(req, res, next) {
        req.myData.auth = rest.auth;
        req.myData.method = {methodName: rest.methodName};
        auth.auth(req, res, next);
    }
    routerMethodList.push(init);

    if(!rest.checkAuthOnly) {
        var reqfile = require(path);
        if (!reqfile[functionName])
            throw common.error('[' + path + '] is not exist function [' + functionName + ']', 'CODE_ERROR');
        var methodFun = function (req, res, next) {
            try{
                reqfile[functionName](req, res, next);
            }catch(e){
                next(e);
            }
        };
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
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
var errorConfig = require('./routes/_system/errorConfig');

app.use(function(err, req, res, next) {
    if(config.env !== 'dev'){
        err.stack = '';
    }
    err.status = err.status || 500;
    err.code = err.code || err.status;
    if (req.headers['x-requested-with'] && req.headers['x-requested-with'].toLowerCase() == 'xmlhttprequest') {
        res.mySend(err, err, {code: err.code});
    } else {
        if (errorConfig.NO_LOGIN.code == err.code)
            res.redirect('/login');
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


process.on('unhandledRejection', function(e){
    var stack = e;
    if(e && e.stack)
        stack = e.stack;
    console.error('unhandledRejection');
    console.error(stack);
});
// production error handler
// no stacktraces leaked to user

module.exports = app;
