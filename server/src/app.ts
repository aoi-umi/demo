import * as debug from 'debug';
import * as express from 'express';
import * as path from 'path';
import * as logger from 'morgan';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';

import { AddressInfo } from 'net';
import config from './config';
import * as main from './_main';

debug('my-application');

var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//app.use(express.static(config.fileDir));
app.use(cors());

//init
main.init();

//注册路由
main.register(app);

/// catch 404 and forwarding to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err['status'] = 404;
    next(err);
});

/// error handlers
//app.use(main.errorHandler);

process.on('unhandledRejection', function (e) {
    console.error('unhandledRejection');
    console.log(e);
});

app.set('port', process.env.PORT || config.port);

var server = app.listen(app.get('port'), '0.0.0.0', function () {
    let address = server.address() as AddressInfo;
    console.log(`${config.name} run at ${address.address}:${address.port},version:${config.version}`);
});

