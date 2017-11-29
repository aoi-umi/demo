var common = require('./_system/common');
var cache = require('./_system/cache');
var errorConfig = require('./_system/errorConfig');
var config = require('../config');

exports.msg = function (req, res) {
    var opt = {
        message: req.query.message || '',
    };
    res.myRender('msg', opt);
};

exports.upload = [require('./_system/multer').any(), function (req, res) {
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
        view: 'msg',
        message: success,
    };
    res.myRender('view', opt);
}];
