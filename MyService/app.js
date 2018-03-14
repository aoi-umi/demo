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
app.use(main.init({viewPath: app.get('views')}));

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
