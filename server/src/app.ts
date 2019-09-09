import * as debug from 'debug';
import * as express from 'express';
import * as logger from 'morgan';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import { AddressInfo } from 'net';
import * as SocketIO from 'socket.io';
import 'reflect-metadata';
import * as config from './config';
import * as main from './_main';


debug('my-application');

process.on('unhandledRejection', function (e) {
    main.logger.error('unhandledRejection');
    main.logger.error(e);
});

//init
main.init().then(() => {
    const app = express();
    app.set('port', process.env.PORT || config.env.port);

    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(cookieParser());
    // app.use(express.static(path.join(__dirname, 'public')));
    //app.use(express.static(config.fileDir));
    app.use(cors());

    main.register(app);

    /// catch 404 and forwarding to error handler
    app.use(function (req, res, next) {
        let err = new Error('Not Found');
        err['status'] = 404;
        res.status(404);
        next(err);
    });

    /// error handlers
    app.use(main.errorHandler);

    const server = app.listen(app.get('port'), '0.0.0.0', function () {
        let address = server.address() as AddressInfo;
        console.log([
            '#################',
            `# ${config.env.name} run at ${address.address}:${address.port},version:${config.env.version}`,
            '#################',
        ].join('\r\n'));
    });
    const io = SocketIO(server, { path: config.env.urlPrefix + '/socket.io' });
    main.initSocket(io);
});