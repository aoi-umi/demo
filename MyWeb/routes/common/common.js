var url = require('url');
var http = require('http');
var crypto = require('crypto');
var config = require('../../config');

exports.resFormat = function(err, data, code){
    var resModel = {};
    if(err){
        resModel.code = '400';
        resModel.description = err.toString();
    }else{
        resModel.code = '200';
        resModel.detail = data;
    }
    if(code) resModel.code = code;
    return resModel;
}

exports.MYEncode = function (str) {
    var buff = new Buffer(str, 'utf8');
    var md5 = crypto.createHash('md5');
    var code = md5.update(buff).digest('base64');
    console.log(md5.update(buff))
    console.log(code)
    return code;
}

//post到服务端
exports.postToUrl = function (method, data, cb) {
    if(!config.api[method]) throw menthod + '为空';
    var _url = url.parse(config.api[method]);

    if (data === null || data === undefined) data = '';
    if (typeof data != 'string') data = JSON.stringify(data);

    var opt = {
        hostname: _url.hostname,
        port: _url.port,
        path: _url.path,
        method: 'POST',
        headers: {
            "Content-Type": 'application/json'
        }
    };

    var body2 = [];
    var req = http.request(opt, function (res) {
        if (res.stat)
            res.setEncoding('utf8');
        var body = [];
        res.on('data', function (chunk) {
            body.push(chunk);
            body2.push(chunk);
        }).on('end', function () {
            try {
                body = Buffer.concat(body);
                var _body = JSON.parse(body);
                cb(null, _body);
            } catch (err) {
                cb(err);
            }
        });
    }).on('error', function (err) {
        console.log('error->' + Buffer.concat(body2));
        console.log('error->' + err);
        cb(err);
    });

    req.write(data);
    req.end();
};

function s4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}

exports.guid = function () {
    return (s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4());
};