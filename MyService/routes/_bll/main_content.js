/**
 * Created by bang on 2017-9-5.
 */
var autoBll = require('./auto');
var common = require('../_system/common');
var myEnum = require('../_system/enum');
var main_content = exports;

exports.query= function(opt) {
    return common.promise().then(function () {
        return autoBll.query('main_content', opt).then(function (t) {
            return t;
        });
    });
};

exports.detailQuery = function(opt) {
    return common.promise().then(function () {
        if(opt.id == 0){
            var detail = {};
            detail.main_content = {id:0};
            detail.main_content_type_list = [];
            detail.main_content_child_list = [];
            detail.main_content_log_list = [];
            return detail;
        }
        return autoBll.customDal('main_content', 'detailQuery', opt).then(function (t) {
            var detail = {};
            detail.main_content = t[0][0];
            detail.main_content_type_list = t[1];
            detail.main_content_child_list = t[2];
            detail.main_content_log_list = t[3];
            if(!detail.main_content)
                throw common.error('', 'DB_NO_DATA');
            detail.main_content.status_name = myEnum.getValue('main_content_status_enum', detail.main_content.status);
            return detail;
        });
    });
};