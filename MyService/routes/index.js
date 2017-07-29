var exports = module.exports;
var common = require('./_system/common');
var cache = require('./_system/cache');
var errorConfig = require('./_system/errorConfig');
var config = require('../config');

exports.use = function(req, res, next){
  //req.query  /?params1=1&params2=2
  //req.body  post的参数
  //req.params /:params1/:params2
  //console.log(require('./routes/_system/common').getClientIp(req));
  req.myData = {};
  var user = req.myData.user = {
    auth: []
  };
  var userInfoKey = req.cookies[config.cacheKey.userInfo];
  if(userInfoKey){
    userInfoKey = config.cacheKey.userInfo + userInfoKey;
    cache.getPromise(userInfoKey).then(function(t){
      if(t){
        req.myData.user = t;
      }
      next();
    }).catch(function(e){
      next(e);
    });
  }else{
    next();
  }
};

exports.get = function (req, res, next) {
  res.render('index', common.formatViewtRes({ title: 'Express', method:'get' }));
};
exports.post = function (req, res, next) {
  res.send(common.formatRes(null, 'post'));
};

exports.loginGet = function (req, res, next) {
  if(common.isInList(req.myData.user.auth, 'login'))
    res.redirect('/users');
  else
    res.render('login', common.formatViewtRes({ title: 'Login'}));
};

exports.loginPost = function (req, res, next) {
  var userName = req.header('user-name');
  var token = req.header('token');
  var reqBody = req.body;
  login(userName, token, reqBody).then(function(){
    var userInfoKey = req.cookies[config.cacheKey.userInfo];
    if(userInfoKey) {
      userInfoKey = config.cacheKey.userInfo + userInfoKey;
      var user = req.myData.user = {
        auth: ['login']
      };
      var hours = new Date().getHours();
      var seconds = parseInt((24 - hours) * 60 * 60);
      cache.setPromise(userInfoKey, user, seconds);
    }
    res.send(common.formatRes(null, 'post'));
  }).catch(function(e){
    res.send(common.formatRes(e, e.code));
  });
};

exports.params = function (req, res, next) {
  res.render('index', common.formatViewtRes({ title: 'Express', method:'params' }));
};

function login(userName, token, req) {
  return new Promise(function (resolve, reject) {
    if(!userName)
      throw common.error(null, errorConfig.CAN_NOT_BE_EMPTY.code, {sourceName:'userName'});
    if (!req)
      req = '';
    if (typeof req != 'string')
      req = JSON.stringify(req);
    var pwd = common.md5('123456');//todo 按用户名查询密码
    var str = userName + pwd + req;
    var checkToken = common.createToken(userName + pwd + req);
    if (token != checkToken)
      throw common.error(null, errorConfig.TOKEN_WRONG.code);
    resolve();
  });
}
