var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cors = require('cors');

var common = require('./routes/_system/common');
var main = require('./routes/_main');

var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

//初始化
app.use(main.init({viewPath: app.get('views')}));

//按restConfig 注册路由
main.register(app, main.restConfig);

/// catch 404 and forwarding to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers
app.use(main.errorHandler);

process.on('unhandledRejection', function (e) {
    console.error('unhandledRejection');
    common.writeError(e);
});

module.exports = app;
