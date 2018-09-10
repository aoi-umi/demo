import * as multer from 'multer';
import config from '../config';

var storage = multer.diskStorage({
    destination: config.fileDir,
});

//添加配置文件到muler对象。
let opt: any = {
    //dest: config.fileDir,
    storage: storage,
    limits: {
        fieldNameSize: '10M'
    }
};
export let myMulter = multer(opt);
export let anyFile = myMulter.any();