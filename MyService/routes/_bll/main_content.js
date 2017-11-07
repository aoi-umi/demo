/**
 * Created by bang on 2017-9-5.
 */
var q = require('q');
var _ = require('underscore');
var autoBll = require('./auto');
var common = require('../_system/common');
var myEnum = require('../_system/enum');
var main_content_bll = exports;

exports.query = function(opt) {
    return common.promise().then(function () {
        return autoBll.query('main_content', opt).then(function (t) {
            if(t.list && t.list.length){
                t.list.forEach(function(item){
                    updateMainContent(item);
                });
            }
            return t;
        });
    });
};

exports.detailQuery = function(opt) {
    return common.promise().then(function () {
        if(opt.id == 0){
            var detail = {};
            detail.main_content = {id:0, status:0};
            detail.main_content_type_list = [];
            detail.main_content_child_list = [];
            detail.main_content_log_list = [];
            return detail;
        }else if(!opt.id) {
            throw common.error('', 'ARGS_ERROR');
        }
        return autoBll.customDal('main_content', 'detailQuery', opt).then(function (t) {
            var detail = {};
            detail.main_content = t[0][0];
            detail.main_content_type_list = t[1];
            detail.main_content_child_list = t[2];
            detail.main_content_log_list = t[3];
            if(!detail.main_content)
                throw common.error('', 'DB_NO_DATA');
            return detail;
        });
    }).then(function(t){
        updateMainContent(t.main_content);
        return t;
    });
};

exports.save = function (opt) {
    var main_content;
    return common.promise().then(function () {
        main_content = opt.main_content;
        return main_content_bll.detailQuery({id: main_content.id});
    }).then(function(main_content_detail) {
        //todo 权限检查
        if(opt.id != 0){

        }
        return autoBll.tran(function (conn) {
            var now = common.dateFormat(new Date(), 'yyyy-MM-dd HH:mm:ss');
            main_content.type = 0;
            main_content.status = 0;
            main_content.user_info_id = 1;
            main_content.operator = 'system';
            main_content.create_date =
                main_content.operate_date = now;
            return autoBll.save('main_content', main_content, conn).then(function (t) {
                var main_content_id = t;
                var list = [];
                //删除child
                if(opt.id != 0 && opt.delMainContentChildList){
                    var del_list = _.filter(main_content_detail.main_content_child_list, function(child){
                        return _.find(opt.delMainContentChildList, function(child_id){return child_id == child.id});
                    });
                    if(del_list && del_list.length) {
                        del_list.forEach(function (item) {
                            list.push(autoBll.del('main_content_child', {id: item.id}, conn));
                        });
                    }
                }
                //保存child
                opt.main_content_child_list.forEach(function (item) {
                    item.main_content_id = main_content_id;
                    list.push(autoBll.save('main_content_child', item, conn));
                });
                //日志
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

function updateMainContent(item){
    item.status_name = myEnum.getValue('main_content_status_enum', item.status);
}