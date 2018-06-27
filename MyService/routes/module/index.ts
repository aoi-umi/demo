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
    common.promise(async () => {
        let files = req.files as Express.Multer.File[];
        var success = files && files.length ? 'upload ' + files.length + ' file(s) success' : 'upload failed';
        if (files) {
            for (let i = 0; i < files.length; i++) {
                let file = files[i];
                var readStream = fs.createReadStream(file.path);
                let buffer = await common.streamToBuffer(readStream);
                let filename = common.md5(buffer);
                await common.promisify(fs.rename)(file.path, file.destination + '/' + filename);
            }
        }
        var opt = {
            message: success,
        };
        res.mySend(null, opt);
    }).catch(e => {
        res.mySend(e);
    });
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
