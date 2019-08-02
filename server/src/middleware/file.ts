import * as multer from "multer";

export class FileMid {
    static single(req, res, next) {
        multer().single('file')(req, res, function (err) {
            if (err) {
                res.json({
                    result: false,
                    msg: '缺少参数'
                });
            } else {
                next();
            }
        })
    }
}