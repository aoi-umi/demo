/**
 * Created by bang on 2017-9-5.
 */
var autoBll = require('./auto');
var db = require('../_system/db');
var common = require('../_system/common');
var logDal = require('../_dal/log');

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
    return logDal.query(opt).then(function(t){
        var resData = {};
        resData.list = t[0];
        if(resData.list.length){
            resData.list.forEach(function(item){
                if(item.create_date)
                    item.create_date = common.dateFormat(item.create_date, 'yyyy-MM-dd HH:mm:ss');
            });
        }
        resData.count = t[1][0].count;
        return resData;
    });
};