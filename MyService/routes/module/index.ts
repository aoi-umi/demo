import * as fs from 'fs';
import {Request, Response} from 'express';
//@ts-ignore
import * as svgCaptcha from 'svg-captcha';

import * as common from '../_system/common';
import * as cache from '../_system/cache';
import * as main from '../_main';

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

export let captchaGet = function (req: Request, res: Response) {
    let captcha = svgCaptcha.create({
        width: 85,
        height: 40
    });
    let key = common.guid();
    cache.set(main.cacheKey.captcha + key, captcha.text, main.cacheTime.captcha).then(() => {
        res.mySend(null, {key: key, svg: captcha.data});
    }).catch(e => {
        res.mySend(e);
    });
};
