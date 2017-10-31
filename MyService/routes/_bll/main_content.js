/**
 * Created by bang on 2017-9-5.
 */
var autoBll = require('./auto');
var common = require('../_system/common');
var main_content = exports;

exports.query= function(opt) {
    return common.promise().then(function () {
        return autoBll.query('main_content', opt).then(function (t) {
            //if(t.list.length){
            //    t.list.forEach(function(item){
            //        if(item.create_date)
            //            item.create_date = common.dateFormat(item.create_date, 'yyyy-MM-dd HH:mm:ss');
            //        if(item.operate_date)
            //            item.operate_date = common.dateFormat(item.operate_date, 'yyyy-MM-dd HH:mm:ss');
            //    });
            //}
            return t;
        });
    });
};