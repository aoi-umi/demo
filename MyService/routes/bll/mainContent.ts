/**
 * Created by bang on 2017-9-5.
 */
import * as q from 'q';
import * as autoBll from './_auto';
import * as common from '../_system/common';
import errorConfig from '../_system/errorConfig';
import * as myEnum from '../_system/enum';
import * as auth from '../_system/auth';
import * as mainContentDal from '../dal/mainContent';

export let query = function (opt, exOpt) {
    var user = exOpt.user;
    return common.promise(function () {
        return mainContentDal.query(opt);
    }).then(function (t) {
        var detail = {
            list: t[0],
            count: t[1][0].count,
            statusList: t[2]
        };
        return detail;
    }).then(function (t) {
        if (t.list && t.list.length) {
            t.list.forEach(function (item) {
                item.operation = ['detailQuery'];
                if (canDelete(item, user))
                    item.operation.push('del');
                updateMainContent(item);
            });
        }
        return t;
    });
};

export let detailQuery = function (opt, exOpt) {
    return common.promise(function () {
        if (opt.id == 0) {
            var detail: any = {};
            detail.mainContent = {id: 0, status: 0, type: 0};
            detail.mainContentTypeList = [];
            detail.mainContentChildList = [];
            detail.mainContentLogList = [];
            return detail;
        } else if (!opt.id) {
            throw common.error('', errorConfig.ARGS_ERROR);
        }
        return mainContentDal.detailQuery(opt).then(function (t) {
            var detail: any = {};
            detail.mainContent = t[0][0];
            detail.mainContentTypeList = t[1];
            detail.mainContentChildList = t[2];
            detail.mainContentLogList = t[3];
            if (!detail.mainContent)
                throw common.error('', errorConfig.DB_NO_DATA);
            return detail;
        });
    }).then(function (t) {
        t.canDelete = canDelete(t.mainContent, exOpt.user);
        updateMainContent(t.mainContent);
        if (t.mainContentLogList) {
            t.mainContentLogList.forEach(function (item) {
                updateMainContentLog(item);
            });
        }
        return t;
    });
};

export let save = function (opt, exOpt) {
    var mainContent;
    var user = exOpt.user;
    return common.promise(function () {
        mainContent = opt.mainContent;
        return detailQuery({id: mainContent.id}, exOpt);
    }).then(function (mainContentDetail) {
        var delChildList, saveChildList;
        if (mainContent.id != 0) {
            //权限检查
            if (user.id != mainContentDetail.mainContent.userInfoId)
                throw common.error('没有权限处理此记录');
            myEnum.enumChangeCheck('mainContentStatusEnum', mainContentDetail.mainContent.status, mainContent.status);
            //要删除的child
            delChildList = mainContentDetail.mainContentChildList.filter(function (child) {
                //查找删除列表中的项
                var match = null;
                if (opt.delMainContentChildList) {
                    match = opt.delMainContentChildList.find(function (childId) {
                        return childId == child.id
                    });
                }
                if (!match) {
                    //查找不存在于保存列表中的项
                    var match2 = opt.mainContentChildList.find(function (saveChild) {
                        return saveChild.id == child.id
                    });
                    match = !match2;
                }
                return match;
            });
        } else {
            mainContent.userInfoId = user.id;
            mainContent.userInfo = user.account + `(${user.nickname}#${user.id})`;
        }
        //要保存的child
        saveChildList = opt.mainContentChildList.filter(function (item) {
            let match = !item.id || mainContentDetail.mainContentChildList.find(function (child) {
                return item.id == child.id;
            });
            return match;
        });

        return autoBll.tran(function (conn) {
            var now = common.dateFormat(new Date(), 'yyyy-MM-dd HH:mm:ss');
            mainContent.type = 0;
            mainContent.operator = `${user.account}(${user.nickname}#${user.id})`;
            mainContent.createDate =
                mainContent.operateDate = now;
            var mainContentId;
            return autoBll.save('mainContent', mainContent, conn).then(function (t) {
                mainContentId = t;
                var list = [];
                if (mainContent.id == 0 && opt.mainContentTypeList) {
                    opt.mainContentTypeList.forEach(ele => {
                        list.push(autoBll.save('mainContentTypeId', {
                            mainContentId: mainContentId,
                            mainContentTypeId: ele
                        }, conn));
                    });
                }
                //删除child
                if (delChildList && delChildList.length) {
                    delChildList.forEach(function (item) {
                        list.push(autoBll.del('mainContentChild', {id: item.id}, conn));
                    });
                }

                //保存child
                saveChildList.forEach(function (item, index) {
                    item.mainContentId = mainContentId;
                    item.num = index + 1;
                    list.push(autoBll.save('mainContentChild', item, conn));
                });
                //日志
                var srcStatus = 0;
                if (mainContent.id != 0)
                    srcStatus = mainContentDetail.mainContent.status;
                var mainContentLog = createLog({
                    id: mainContentId,
                    srcStatus: srcStatus,
                    destStatus: mainContent.status,
                    content: opt.remark,
                    user: user
                });
                list.push(autoBll.save('mainContentLog', mainContentLog, conn));
                return q.all(list);
            }).then(function () {
                return mainContentId;
            });
        }).then(function (t) {
            return t;
        });
    });
};

export let statusUpdate = function (opt, exOpt) {
    var mainContent = opt.mainContent;
    var user = exOpt.user;
    var necessaryAuth;
    return common.promise(function () {
        if (!mainContent.id) {
            throw common.error('', errorConfig.ARGS_ERROR);
        }
        var operate = mainContent.operate;
        if (operate == 'audit')
            mainContent.status = 2;
        else if (operate == 'pass')
            mainContent.status = 3;
        else if (operate == 'notPass')
            mainContent.status = 4;
        else if (operate == 'del')
            mainContent.status = -1;
        else if (operate == 'recovery')
            mainContent.status = 'recovery';
        else
            throw common.error(`错误的操作类型[${operate}]`);

        necessaryAuth = 'mainContent' + common.stringToPascal(operate);
        if (!auth.isHadAuthority(user, necessaryAuth))
            throw common.error(`没有[${necessaryAuth}]权限`);
        return detailQuery({id: mainContent.id}, {user: exOpt.user});
    }).then(function (mainContentDetail) {
        if (necessaryAuth == 'mainContentDel' && !mainContentDetail.canDelete) {
            throw common.error(`没有权限`);
        }

        myEnum.enumChangeCheck('mainContentStatusEnum', mainContentDetail.mainContent.status, mainContent.status);
        if (mainContent.status == 'recovery') {
            var mainContentLogList = mainContentDetail.mainContentLogList;
            if (!mainContentLogList || !mainContentLogList.length
                || mainContentLogList[0].srcStatus == undefined) {
                throw common.error('数据有误');
            }
            mainContent.status = mainContentLogList[0].srcStatus;
        }
        return autoBll.tran(function (conn) {
            var now = common.dateFormat(new Date(), 'yyyy-MM-dd HH:mm:ss');
            var updateStatusOpt = {
                id: mainContent.id,
                status: mainContent.status,
                operatorId: user.id,
                operator: user.account + `(${user.nickname}#${user.id})`,
                operateDate: now
            };
            var mainContentId;
            return autoBll.save('mainContent', updateStatusOpt, conn).then(function (t) {
                mainContentId = t;
                var list = [];
                //日志
                var mainContentLog = createLog({
                    id: mainContentId,
                    srcStatus: mainContentDetail.mainContent.status,
                    destStatus: mainContent.status,
                    content: opt.remark,
                    user: user,
                });
                list.push(autoBll.save('mainContentLog', mainContentLog, conn));
                return q.all(list)
            }).then(function () {
                return mainContentId;
            });
        });
    });
};

function createLog(opt) {
    var now = common.dateFormat(new Date(), 'yyyy-MM-dd HH:mm:ss');
    var user = opt.user;
    var mainContentLog = {
        mainContentId: opt.id,
        type: 0,
        srcStatus: opt.srcStatus,
        destStatus: opt.destStatus,
        content: '保存',
        createDate: now,
        operateDate: now,
        operatorId: user.id,
        operator: user.account + `(${user.nickname}#${user.id})`,
    };
    if (opt.srcStatus == -1) {
        mainContentLog.type = 6;
        mainContentLog.content = '恢复';
    }
    else if (opt.destStatus == 1) {
        mainContentLog.type = 1;
        mainContentLog.content = '提交';
    } else if (opt.destStatus == 2) {
        mainContentLog.type = 2;
        mainContentLog.content = '审核';
    } else if (opt.destStatus == 3) {
        mainContentLog.type = 3;
        mainContentLog.content = '审核通过';
    } else if (opt.destStatus == 4) {
        mainContentLog.type = 4;
        mainContentLog.content = '审核不通过';
    } else if (opt.destStatus == -1) {
        mainContentLog.type = 5;
        mainContentLog.content = '删除';
    }
    if (opt.content)
        mainContentLog.content = opt.content;
    return mainContentLog;
}

function updateMainContent(item) {
    item.typeName = myEnum.getValue('mainContentTypeEnum', item.type);
    item.statusName = myEnum.getValue('mainContentStatusEnum', item.status);
}

function updateMainContentLog(item) {
    item.typeName = myEnum.getValue('mainContentLogTypeEnum', item.type);
    item.srcStatusName = myEnum.getValue('mainContentStatusEnum', item.srcStatus);
    item.destStatusName = myEnum.getValue('mainContentStatusEnum', item.destStatus);
}

function canDelete(mainContent, user) {
    if (mainContent.status != -1
        && ((auth.isHadAuthority(user, ['mainContentDel']) && (user.id == mainContent.userInfoId))
            || (auth.isHadAuthority(user, ['admin']) && mainContent.status != 0))
    ) {
        return true;
    }
    return false;
}