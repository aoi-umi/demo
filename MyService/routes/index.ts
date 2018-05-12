import * as fs from 'fs';
import * as common from './_system/common';
import multer from './_system/myMulter';

export let msg = function (req, res) {
    var notSupportedBrowser = common.parseBool(req.query.notSupportedBrowser);

    var opt = {
        message: req.query.message || '',
        notSupportedBrowser: notSupportedBrowser
    };
    res.myRender('msg', opt);
};

export let upload = [multer.any(), function (req, res) {
    var success = req.files && req.files.length ? 'upload ' + req.files.length + ' file(s) success' : 'upload failed';
    if (req.files) {
        req.files.forEach(function (file) {
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
}];
