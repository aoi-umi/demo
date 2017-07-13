/**
 * Created by umi on 2017-5-29.
 */
var _ = require('underscore');
var exports = module.exports;
exports.auth = function(req, res, next) {
    //url权限认证
    var auth = req.myData.auth;
    var user = req.myData.user;
    var permissionRes = authenticationCheck(user, auth);
    if(permissionRes.noPermission){
        var err = new Error(permissionRes.desc || 'No Permissions');
        err.status = 403;
        next(err);
    }else{
        next();
    }
};

var authenticationCheck = function (user, authList) {
    var noPermission = true;
    var desc = '';
    if(!authList || !authList.length){
        noPermission = false;
    }else {
        if (user && user.auth && user.auth.length) {
            noPermission = false;
            for (var i = 0; i < authList.length; i++) {
                var hasAuth = _.find(user.auth, function (auth) {
                    return auth == authList[i].key;
                });
                if (!hasAuth) {
                    desc = authList[i].desc;
                    noPermission = true;
                    break;
                }
            }
        }else{
            desc = authList[0].desc;
            noPermission = true;
        }
    }
    return {noPermission: noPermission, desc:desc};
}