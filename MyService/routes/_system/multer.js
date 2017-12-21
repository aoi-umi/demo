var multer = require('multer');
var config = require('../../config');
var common = require('../_system/common');
var fs = require('fs');

var storage = multer.diskStorage({
    destination: config.fileDir,
    // filename: function (req, file, cb) {
    //     common.streamToBuffer(readStream).then(function (buffer) {
    //         return common.md5(buffer);
    //     }).then(function (filename){
    //         cb(null, filename);
    //     }).fail(function (err) {
    //         cb(err);
    //     });
    // }
});

//添加配置文件到muler对象。
module.exports = multer({
    //dest: config.fileDir,
    storage: storage,
    limits: {
        fieldNameSize: '10M'
    }
});