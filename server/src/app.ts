import 'module-alias/register';
import * as debug from 'debug';
import * as express from 'express';
import * as logger from 'morgan';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import * as bodyParserXml from 'body-parser-xml';
import * as cors from 'cors';
import { AddressInfo } from 'net';
import 'reflect-metadata';
import * as mongoose from 'mongoose';

import * as config from '@/config';

bodyParserXml(bodyParser);
debug('my-application');
(async () => {
    await mongoose.connect(config.env.mongoose.uri, config.env.mongoose.options);
})().then(async () => {
    const main = require('./_main');
    process.on('unhandledRejection', function (e) {
        main.logger.error('unhandledRejection');
        main.logger.error(e);
    });
    await main.init();
    const app = express();
    app.set('port', process.env.PORT || config.env.port);

    app.use(logger('dev'));
    app.use(bodyParser['xml']({ xmlParseOptions: { explicitArray: false } }));
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
    main.initSocket(server);
});