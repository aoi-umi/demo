var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var config = require('./config');
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

app.use('/', function (req, res, next) {
    //req.query  /?params1=1&params2=2
    //req.body  post的参数
    //req.params /:params1/:params2
    console.log(require('./routes/_system/common').getClientIp(req));
    req.myData = {};
    for(var i = 0; i < restConfig.length; i++) {
        var rest = restConfig[i];
        if(req.originalUrl == rest.url){
            req.myData.auth = rest.auth;
            break;
        }
    }
    next();
});
var auth = require('./routes/_system/auth');
var restConfig = require('./rest_config');
var restList = [];
for(var i = 0; i < restConfig.length; i++){
    var rest  = restConfig[i];
    for(var imethod = 0;imethod < rest.method.length; imethod++){
        var method = rest.method[imethod];
        var path = rest.path || rest.url;
        if(path && path.substr(0, 1) !== '/')
            path = '/' + path;
        path = './routes' + path;
        var reqfile = require(path);
        var isRouter = true;
        switch (method.toLowerCase()) {
            case 'get':
                app.get(rest.url, auth.auth, reqfile.get);
                break;
            case 'post':
                app.post(rest.url, auth.auth, reqfile.post);
                break;
            default:
                isRouter = false;
                break;
        }
        if(isRouter){
            restList.push({url: rest.url, method: method, path: path});
        }
    }
}
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
if (config.env === '_dev') {
    app.use(function(err, req, res, next) {
        err.status = err.status || 500;
        res.status(err.status);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
