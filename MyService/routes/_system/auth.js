/**
 * Created by umi on 2017-5-29.
 */
var express = require('express');
var _ = require('underscore');
var exports = module.exports;
exports.auth = function(req, res, next) {
    //res.send('respond with a resource');
    //console.log(req.myData)
    //url权限认证
    var noPermission = true;
    var auth = req.myData.auth;
    var user = req.myData.user;
    noPermission = authenticationCheck(user, auth);

    if(noPermission){
        var err = new Error('No Permissions');
        err.status = 403;
        next(err);
    }else{
        next();
    }
};

var authenticationCheck = function (user, authList) {
    var noPermission = true;
    if(!authList || !authList.length){
        noPermission = false;
    }else {
        if (user && user.auth && user.auth.length) {
            var authCount = 0;
            for (var i = 0; i < user.auth.length; i++) {
                var hasAuth = _.find(authList, function (auth) {
                    return auth == user.auth[i];
                });
                if (hasAuth) {
                    authCount++;
                }
                if (authCount == authList.length) {
                    noPermission = false;
                    break;
                }
            }
        }
    }
    return noPermission;
}