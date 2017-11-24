var common = require('./_system/common');
var cache = require('./_system/cache');
var errorConfig = require('./_system/errorConfig');
var config = require('../config');
var fs = require('fs');

var autoBll = require('./_bll/auto');
var userInfoBll = require('./_bll/user_info');
var logBll = require('./_bll/log');

exports.post = function (req, res, next) {
    res.mySend(null, 'post');
};

exports.loginGet = function (req, res, next) {
    if (req.myData.user.authority['login'])
        res.redirect('/');
    else
        res.myRender('view', {view: 'login', title: 'Login'});
};

exports.tranTest = function(req, res){
    var reqData = req.body;
    logBll.tranTest(reqData).then(function(t){
        res.mySend(null, t);
    }).fail(function(e){
        res.mySend(e, null,{code: '400'});
    })
};

exports.upload = [require('./_system/multer').any(), function (req, res) {
    var success = req.files && req.files.length ? 'upload ' + req.files.length + ' file(s) success' : 'upload failed';
    if(req.files) {
        req.files.forEach(function (file) {
            var readStream = fs.createReadStream(file.path);
            common.streamToBuffer(readStream).then(function (buffer) {
                return common.md5(buffer);
            }).then(function (filename){
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
