/**
 * Created by umi on 2017-5-29.
 */
var _ = require('underscore');
var common = require('./common');
var errorConfig = require('./errorConfig');
var exports = module.exports;
exports.auth = function(req, res, next) {
    //url权限认证
    var auth = req.myData.auth;
    var user = req.myData.user;
    var permissionRes = authenticationCheck(user, auth);
    if (permissionRes.noPermission) {
        var err = common.error('', permissionRes.errCode || errorConfig.NO_PERMISSIONS.code);
        err.status = 403;
        next(err);
    } else {
        next();
    }
};

var authenticationCheck = function (user, authList) {
    var noPermission = true;
    var desc = '';
    var errCode = '';
    var notPassAuth = null;
    if(!authList || !authList.length){
        noPermission = false;
    }else {
        if (user && user.auth && user.auth.length) {
            noPermission = false;
            authList.forEach(function(checkAuth){
                var hasAuth = _.find(user.auth, function (auth) {
                    return auth == checkAuth.key;
                });
                if (!hasAuth) {
                    notPassAuth = checkAuth;
                    return false;
                }
            });
        }else{
            notPassAuth = authList[0];
        }
        if(notPassAuth){
            errCode = notPassAuth.errCode;
            noPermission = true;
        }
    }
    return {noPermission: noPermission,errCode:errCode};
}