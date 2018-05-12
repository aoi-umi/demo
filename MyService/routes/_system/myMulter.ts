import * as multer from 'multer';
import config from '../../config';
import * as common from '../_system/common';
import * as fs from 'fs';

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
let opt: any = {
    //dest: config.fileDir,
    storage: storage,
    limits: {
        fieldNameSize: '10M'
    }
};
export default multer(opt);