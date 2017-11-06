/**
 * Created by bang on 2017-9-5.
 */
var q = require('q');
var autoBll = require('./auto');
var common = require('../_system/common');
var myEnum = require('../_system/enum');
var main_content = exports;

exports.query = function(opt) {
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

exports.save = function (opt) {
    return common.promise().then(function () {
        return autoBll.tran(function (conn) {
            var now = common.dateFormat(new Date(), 'yyyy-MM-dd HH:mm:ss');
            var main_content = opt.main_content
            main_content.type = 0;
            main_content.status = 0;
            main_content.user_info_id = 1;
            main_content.operator = 'system';
            main_content.create_date =
                main_content.operate_date = now;
            return autoBll.save('main_content', main_content, conn).then(function (t) {
                var main_content_id = t;
                var list = [];
                opt.main_content_child_list.forEach(function (item) {
                    item.main_content_id = main_content_id;
                    list.push(autoBll.save('main_content_child', item, conn));
                });
                var main_content_log = {
                    main_content_id: main_content_id,
                    type: 0,
                    content: '保存',
                    create_date: now,
                    operate_date: now,
                    operator: 'system'
                };
                list.push(autoBll.save('main_content_log', main_content_log, conn));
                return q.all(list).then(function () {
                    return main_content_id;
                });
            });
        }).then(function (t) {
            return t;
        });
    });
};