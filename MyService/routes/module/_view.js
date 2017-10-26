/**
 * Created by umi on 2017-9-24.
 */
var path = require('path');
var fs = require('fs');
var common = require('../_system/common');
var myEnum = require('./../_system/enum');
exports.get = function (req, res, next) {
    var opt = {
        view: '/index',
    }
    //console.log(req.originalUrl, req._parsedUrl.pathname)
    switch (req._parsedUrl.pathname) {
        case '/':
            opt.method = 'get';
            break;
        default:
            opt.view = req._parsedUrl.pathname;
            break;
    }

    var moduleViewPath = path.join(req.myData.viewPath, 'module', opt.view + '.ejs');
    var isExist = fs.existsSync(moduleViewPath);
    if (!isExist)
        return next();
    
    switch (opt.view) {
        case '/status':
            opt.enumDict = myEnum.enumDict;
            opt.enumCheck = myEnum.enumCheck;
            break;
    }
    res.myRender('view', opt);
};