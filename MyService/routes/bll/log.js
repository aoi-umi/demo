/**
 * Created by bang on 2017-9-5.
 */
var autoBll = require('./_auto');
var common = require('../_system/common');

exports.query = function(opt){
    return autoBll.customDal('log', 'query', opt).then(function(t){
        var resData = {};
        resData.list = t[0];
        resData.count = t[1][0].count;
        return resData;
    });
};