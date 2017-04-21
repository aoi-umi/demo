var Q = require('q');
var common = require('./common/common.js');
var memcache = require('./common/memcache.js');
var config = require('../config.js');
var account = require('../bll/account');

exports.islogin = function(req, res, next){
    var key = req.cookies[config.cookies.user];
    if(!key) return res.redirect('/login');
    Q.denodeify(memcache.get)(key).then(function(data){
        if(!data){
            throw 'login timeout';
        }
        var user = res.locals.user = JSON.parse(data);
        return Q.denodeify(memcache.set(key,JSON.stringify(user),config.cacheTime.user));
    }).then(function(){
        next();
    }).fail(function (err) {
        //判断是ajax请求
        if (req.headers['x-requested-with'] == 'XMLHttpRequest') {
            return res.send(common.resFormat("<script>parent.location.href='/'</script>"));
        }
        else {
            return res.redirect('/login');
        }
    });
}

exports.login = function(req, res, next) {
    var key = req.cookies[config.cookies.user];
    var args = req.body;
    //console.log(args);
    if(!key) key = common.guid();
    Q.denodeify(memcache.get)(key).then(function (data) {
        if (!data) {
            return Q.denodeify(account.detail_query)(args);
        }
        else {
            var user = res.locals.user = JSON.parse(data);
            key = common.guid();
            res.cookie(config.cookies.user, key, {httpOnly: true});
            return user;
        }

    }).then(function (data) {
        if(typeof data == "string") data = JSON.parse(data);
        var user = data;
        if(!user) throw 'account or password incorrect';
        //console.log(user);
        return Q.denodeify(memcache.set)(key, JSON.stringify(user), config.cacheTime.user);
    }).then(function () {
        return res.send(common.resFormat(null));
    }).fail(function (err) {
        return res.send(common.resFormat('login failed,' + err));
    });
}

