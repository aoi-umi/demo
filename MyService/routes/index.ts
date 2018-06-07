import * as fs from 'fs';
import { Request, Response, Express } from 'express';
import * as Multer from 'multer';

import * as common from './_system/common';

export let msg = function (req: Request, res: Response) {
    var notSupportedBrowser = common.parseBool(req.query.notSupportedBrowser);

    var opt = {
        message: req.query.message || '',
        notSupportedBrowser: notSupportedBrowser
    };
    res.myRender('msg', opt);
};

export let upload = function (req: Request, res: Response) {
    let flies = req.files as Express.Multer.File[];
    var success = flies && flies.length ? 'upload ' + flies.length + ' file(s) success' : 'upload failed';
    if (flies) {
        flies.forEach(function (file) {
            var readStream = fs.createReadStream(file.path);
            common.streamToBuffer(readStream).then(function (buffer) {
                return common.md5(buffer);
            }).then(function (filename) {
                fs.rename(file.path, file.destination + '/' + filename);
            });
        });
    }
    var opt = {
        message: success,
    };
    res.mySend(null, opt);
};
