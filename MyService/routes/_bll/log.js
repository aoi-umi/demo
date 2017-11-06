/**
 * Created by bang on 2017-9-5.
 */
var autoBll = require('./auto');
var db = require('../_system/db');
var common = require('../_system/common');

//事务测试
exports.tranTest = function (opt) {
    return autoBll.tran(function(conn, res){
        var resData = [];
        var log = common.logModle();
        log.req = '事务请求测试1';
        return autoBll.save('log', log, conn).then(function(t){
            resData.push(t);
            if(opt && opt.error)
                throw common.error('test error');
            var log = common.logModle();
            log.req = '事务请求测试2';
            return autoBll.save('log', log, conn);
        }).then(function(t){
            resData.push(t);
            return resData;
        });
    });
};

exports.query = function(opt){
    return autoBll.customDal('log', 'query', opt).then(function(t){
        var resData = {};
        resData.list = t[0];
        resData.count = t[1][0].count;
        return resData;
    });
};