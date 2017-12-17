/**
 * Created by bang on 2017-9-5.
 */
var q = require('q');
var _ = require('underscore');
var autoBll = require('./auto');
var common = require('../_system/common');
var myEnum = require('../_system/enum');
var auth = require('../_system/auth');
var main_content_bll = exports;

exports.query = function (opt, exOpt) {
    var user = exOpt.user;
    return common.promise().then(function () {
        return autoBll.customDal('main_content', 'query', opt).then(function (t) {
            var detail = {
                list: t[0],
                count: t[1][0].count,
                status_list: t[2]
            };
            return detail;
        }).then(function (t) {
            if (t.list && t.list.length) {
                t.list.forEach(function (item) {
                    item.operation = ['detailQuery'];
                    if (item.status != -1
                        && ((auth.isHadAuthority(user, ['mainContentDel']) && (user.id == item.user_info_id))
                            || auth.isHadAuthority(user, ['admin']))
                    ) {
                        item.operation.push('del');
                    }
                    updateMainContent(item);
                });
            }
            return t;
        });
    });
};

exports.detailQuery = function (opt) {
    return common.promise().then(function () {
        if (opt.id == 0) {
            var detail = {};
            detail.main_content = {id: 0, status: 0, type: 0};
            detail.main_content_type_list = [];
            detail.main_content_child_list = [];
            detail.main_content_log_list = [];
            return detail;
        } else if (!opt.id) {
            throw common.error('', 'ARGS_ERROR');
        }
        return autoBll.customDal('main_content', 'detailQuery', opt).then(function (t) {
            var detail = {};
            detail.main_content = t[0][0];
            detail.main_content_type_list = t[1];
            detail.main_content_child_list = t[2];
            detail.main_content_log_list = t[3];
            if (!detail.main_content)
                throw common.error('', 'DB_NO_DATA');
            return detail;
        });
    }).then(function (t) {
        updateMainContent(t.main_content);
        if (t.main_content_log_list) {
            t.main_content_log_list.forEach(function (item) {
                updateMainContentLog(item);
            });
        }
        return t;
    });
};

exports.save = function (opt, exOpt) {
    var main_content;
    var user = exOpt.user;
    return common.promise().then(function () {
        main_content = opt.main_content;
        return main_content_bll.detailQuery({id: main_content.id});
    }).then(function (main_content_detail) {
        var delChildList;
        if (main_content.id != 0) {
            //权限检查
            if (user.id != main_content.user_info_id)
                throw common.error('没有权限处理此记录');
            myEnum.enumChangeCheck('main_content_status_enum', main_content_detail.main_content.status, main_content.status);
            //要删除的child
            var delChildList = _.filter(main_content_detail.main_content_child_list, function (child) {
                //查找删除列表中的项
                var match = null;
                if (opt.delMainContentChildList) {
                    match = _.find(opt.delMainContentChildList, function (child_id) {
                        return child_id == child.id
                    });
                }
                if (!match) {
                    //查找不存在于保存列表中的项
                    var match2 = _.find(opt.main_content_child_list, function (save_child) {
                        return save_child.id == child.id
                    });
                    match = !match2;
                }
                return match;
            });
        } else {
            main_content.user_info_id = user.id;
            main_content.user_info = user.account + `(${user.nickname}#${user.id})`;
        }

        return autoBll.tran(function (conn) {
            var now = common.dateFormat(new Date(), 'yyyy-MM-dd HH:mm:ss');
            main_content.type = 0;
            main_content.operator = user.account + `(${user.nickname}#${user.id})`;
            main_content.create_date =
                main_content.operate_date = now;
            return autoBll.save('main_content', main_content, conn).then(function (t) {
                var main_content_id = t;
                var list = [];
                //删除child
                if (delChildList && delChildList.length) {
                    delChildList.forEach(function (item) {
                        list.push(autoBll.del('main_content_child', {id: item.id}, conn));
                    });
                }

                //保存child
                opt.main_content_child_list.forEach(function (item, index) {
                    item.main_content_id = main_content_id;
                    item.num = index + 1;
                    list.push(autoBll.save('main_content_child', item, conn));
                });
                //日志
                var src_status = 0;
                if (main_content.id != 0)
                    src_status = main_content_detail.main_content.status;
                var main_content_log = createLog({
                    id: main_content_id,
                    src_status: src_status,
                    dest_status: main_content.status,
                    content: opt.remark,
                    user: user
                });
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

exports.statusUpdate = function (opt, exOpt) {
    var main_content = opt.main_content;
    var user = exOpt.user;
    var necessaryAuth;
    return common.promise().then(function () {
        if (!main_content.id) {
            throw common.error('', 'ARGS_ERROR');
        }
        var operate = main_content.operate;
        if (operate == 'audit')
            main_content.status = 2;
        else if (operate == 'pass')
            main_content.status = 3;
        else if (operate == 'notPass')
            main_content.status = 4;
        else if (operate == 'del')
            main_content.status = -1;
        else if (operate == 'recovery')
            main_content.status = 'recovery';
        else
            throw common.error(`错误的操作类型[${operate}]`);

        necessaryAuth = 'mainContent' + common.stringToPascal(operate);
        if (!auth.isHadAuthority(user, necessaryAuth))
            throw common.error(`没有[${necessaryAuth}]权限`);
        return main_content_bll.detailQuery({id: main_content.id});
    }).then(function (main_content_detail) {
        if (necessaryAuth == 'mainContentDel'
            && (!auth.isHadAuthority(user, 'admin') && main_content_detail.main_content.user_info_id != user.id))
            throw common.error(`没有权限`);

        myEnum.enumChangeCheck('main_content_status_enum', main_content_detail.main_content.status, main_content.status);
        if (main_content.status == 'recovery') {
            var main_content_log_list = main_content_detail.main_content_log_list;
            if (!main_content_log_list || !main_content_log_list.length
                || main_content_log_list[0].src_status == undefined) {
                throw common.error('数据有误');
            }
            main_content.status = main_content_log_list[0].src_status;
        }
        return autoBll.tran(function (conn) {
            var now = common.dateFormat(new Date(), 'yyyy-MM-dd HH:mm:ss');
            var updateStatusOpt = {
                id: main_content.id,
                status: main_content.status,
                operator_id: user.id,
                operator: user.account + `(${user.nickname}#${user.id})`,
                operate_date: now
            };
            return autoBll.save('main_content', updateStatusOpt, conn).then(function (t) {
                var main_content_id = t;
                var list = [];
                //日志
                var main_content_log = createLog({
                    id: main_content_id,
                    src_status: main_content_detail.main_content.status,
                    dest_status: main_content.status,
                    content: opt.remark,
                    user: user,
                });
                list.push(autoBll.save('main_content_log', main_content_log, conn));
                return q.all(list).then(function () {
                    return main_content_id;
                });
            });
        });
    });
};

function createLog(opt) {
    var now = common.dateFormat(new Date(), 'yyyy-MM-dd HH:mm:ss');
    var user = opt.user;
    var main_content_log = {
        main_content_id: opt.id,
        type: 0,
        src_status: opt.src_status,
        dest_status: opt.dest_status,
        content: '保存',
        create_date: now,
        operate_date: now,
        operator_id: user.id,
        operator: user.account + `(${user.nickname}#${user.id})`,
    };
    if (opt.src_status == -1) {
        main_content_log.type = 6;
        main_content_log.content = '恢复';
    }
    else if (opt.dest_status == 1) {
        main_content_log.type = 1;
        main_content_log.content = '提交';
    } else if (opt.dest_status == 2) {
        main_content_log.type = 2;
        main_content_log.content = '审核';
    } else if (opt.dest_status == 3) {
        main_content_log.type = 3;
        main_content_log.content = '审核通过';
    } else if (opt.dest_status == 4) {
        main_content_log.type = 4;
        main_content_log.content = '审核不通过';
    } else if (opt.dest_status == -1) {
        main_content_log.type = 5;
        main_content_log.content = '删除';
    }
    if (opt.content)
        main_content_log.content = opt.content;
    return main_content_log;
}

function updateMainContent(item) {
    item.type_name = myEnum.getValue('main_content_type_enum', item.type);
    item.status_name = myEnum.getValue('main_content_status_enum', item.status);
}

function updateMainContentLog(item) {
    item.type_name = myEnum.getValue('main_content_log_type_enum', item.type);
    item.src_status_name = myEnum.getValue('main_content_status_enum', item.src_status);
    item.dest_status_name = myEnum.getValue('main_content_status_enum', item.dest_status);
}