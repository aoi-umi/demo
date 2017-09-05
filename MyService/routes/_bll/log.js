/**
 * Created by bang on 2017-9-5.
 */
var autoBll = require('./auto');
var db = require('../_system/db');
var common = require('../_system/common');
var exports = module.exports;

//事务测试
exports.tranTest = function (opt) {
    var res = common.defer();
    db.tranConnect(function(conn){
        var resData = [];
        return common.promise().then(function(){
            var log = common.logModle();
            log.req = '事务请求测试1';
            return autoBll.save('log', log, conn);
        }).then(function(t){
            resData.push(t);
            if(opt && opt.error)
                throw common.error('test error');
            var log = common.logModle();
            log.req = '事务请求测试2';
            return autoBll.save('log', log, conn);
        }).then(function(t){
            resData.push(t);
            return resData;
        }).then(res.resolve).fail(function(e){
            res.reject(e);
            throw e;
        });
    });
    return res.promise;
};