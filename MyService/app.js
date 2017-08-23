var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var config = require('./config');
var common = require('./routes/_system/common');
var app = express();
console.log(config.name,'run at port ', config.port, ',version:', config.version);
// view engine setup
app.set('views', path.join(__dirname, 'views' + config.env));
app.set('view engine', 'ejs');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public' + config.env)));

app.use(function (req, res, next) {
    //req.query  /?params1=1&params2=2
    //req.body  post的参数
    //req.params /:params1/:params2
    //console.log(require('./routes/_system/common').getClientIp(req));
    res.myRender = function (view, options, fn) {
        var opt = {
            user: req.myData.user
        };
        opt = common.extend(opt, options);
        res.render(view, common.formatViewtRes(opt));
    };

    res.mySend = function (err, detail, desc) {
        var formatRes = common.formatRes(err, detail, desc);
        res.send(formatRes);
        var url = req.originalUrl;
        var result = formatRes.result;
        var logReq = req.method == 'POST' ? req.body : '';
        var logRes = formatRes.detail;
        var logMethod = '[' + (config.name + '][' + (req.myData.method.methodName || url)) + ']';

        url = req.header('host') + url;
        var log = common.logModle();
        log.url = url;
        log.result = result;
        log.method = logMethod
        log.req = logReq;
        log.res = logRes;
        log.ip = common.getClientIp(req);
        log.remark = formatRes.desc;
        common.logSave(log);
    };

    req.myData = {
        method: {},
        user: {
            nickname: 'guest',
            authority: {}
        }
    };
    var user = req.myData.user;
    if(config.env == '_dev')
        user.authority['dev'] = true;
    next();
});

var auth = require('./routes/_system/auth');
var restConfig = require('./rest_config');
var restList = [];
restConfig.forEach(function(rest){
    rest.method.forEach(function(method, imethod){
        var method = rest.method[imethod];
        var path = rest.path || rest.url;
        if (path && path.substr(0, 1) !== '/')
            path = '/' + path;
        path = './routes' + path;
        var reqfile = require(path);
        var isRouter = true;
        var functionName = method.functionName || method.name;
        if(!reqfile[functionName])
            throw new Error('[' + path + '] is not exist function [' + functionName + ']');
        function init(req, res, next) {
            req.myData.auth = rest.auth;
            req.myData.method = method;
            auth.auth(req, res, next);
        }
        switch (method.name.toLowerCase()) {
            case 'use':
                app.use(rest.url, reqfile[functionName]);
            case 'get':
                app.get(rest.url, init, reqfile[functionName]);
                break;
            case 'post':
                app.post(rest.url, init,  reqfile[functionName]);
                break;
            default:
                isRouter = false;
                break;
        }
        if (isRouter) {
            restList.push({url: rest.url, method: method, path: path});
        }
    });
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
    if(config.env !== '_dev'){
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
            res.render('error',
                common.formatViewtRes({
                    title: '出错了',
                    message: err.message,
                    error: err
                }));
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
