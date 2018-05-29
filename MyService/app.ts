import * as debug from 'debug';
import * as express from 'express';
import * as path from 'path';
import * as favicon from 'serve-favicon';
import * as logger from 'morgan';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';

import config from './config';
import * as common from './routes/_system/common';
import * as main from './routes/_main';
import * as auth from './routes/_system/auth';

debug('my-application');

var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon(path.join(__dirname, '/public/img/favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

//初始化
app.use(main.init({ viewPath: app.get('views') }));
//检查路由权限
app.use(auth.check);

//注册路由
app.use(main.routes);

//按routeConfig 注册路由
main.register(app, main.routeConfig);

/// catch 404 and forwarding to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err['status'] = 404;
    next(err);
});

/// error handlers
app.use(main.errorHandler);

process.on('unhandledRejection', function (e) {
    console.error('unhandledRejection');
    common.writeError(e);
});

app.set('port', process.env.PORT || config.port);

var server = app.listen(app.get('port'), function () {
    debug('Express server listening on port ' + server.address().port);
});

console.log(config.name, 'run at port ', server.address().port, ',version:', config.version);

import * as socketIO from 'socket.io';
import * as socket from './routes/socket';
let io = socketIO(server);
socket.init(io);
//test
//let x: model.Authority = {};