/**
 * Created by bang on 2017-9-5.
 */
import * as q from 'q';
import * as autoBll from './_auto';
import * as common from '../_system/common';
import errorConfig from '../_system/errorConfig';
import * as myEnum from '../_system/enum';
import * as auth from '../_system/auth';
import { MainContent } from '../dal/models/dbModel/MainContent';

export let query = function (opt, exOpt) {
    var user = exOpt.user;
    return common.promise(async function () {
        let t = await MainContent.customQuery(opt);
        if (t.list && t.list.length) {
            t.list.forEach(function (ele) {
                let item = ele as (typeof ele) & { operation: string[] }
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
    return common.promise(async function () {
        let detail = {
            mainContent: null,
            mainContentTypeList: [],
            mainContentChildList: [],
            mainContentLogList: [],
            canDelete: true
        };
        if (opt.id == 0) {
            detail.mainContent = { id: 0, status: 0, type: 0 };
        } else if (!opt.id) {
            throw common.error('', errorConfig.ARGS_ERROR);
        } else {            
            let t = await MainContent.customDetailQuery(opt);
            detail = {
                ...detail, ...t
            };
            if (!detail.mainContent)
                throw common.error('', errorConfig.DB_NO_DATA, { lang: exOpt.req.myData.lang });
        }

        //处理数据
        detail.canDelete = canDelete(detail.mainContent, exOpt.user);
        updateMainContent(detail.mainContent);
        if (detail.mainContentLogList) {
            detail.mainContentLogList.forEach(function (item) {
                updateMainContentLog(item);
            });
        }
        if (detail.mainContentTypeList) {
            detail.mainContentTypeList.forEach((ele) => {
                if (ele.mainContentTypeName)
                    ele.typeName = ele.mainContentTypeName;
                delete ele.mainContentTypeName;
            });
        }
        return detail;
    });
};

export let save = function (opt, exOpt) {
    var mainContent;
    var user = exOpt.user;
    return common.promise(async function () {
        mainContent = opt.mainContent;
        let mainContentDetail = await detailQuery({ id: mainContent.id }, exOpt);
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
        let mainContentWithTypeList = [];
        if (mainContent.id != 0) {
            let query = await autoBll.modules.mainContentWithType.query({ mainContentId: mainContent.id });
            mainContentWithTypeList = query.list;
        }

        //保存
        return autoBll.tran(async function (conn) {
            var now = common.dateFormat(new Date(), 'yyyy-MM-dd HH:mm:ss');
            mainContent.type = 0;
            mainContent.operator = `${user.account}(${user.nickname}#${user.id})`;
            mainContent.createDate =
                mainContent.operateDate = now;
            let mainContentId = await autoBll.modules.mainContent.save(mainContent, conn);

            var list = [];
            if (opt.mainContentTypeList) {
                //覆盖旧数据，删除多余
                opt.mainContentTypeList.forEach((ele, idx) => {
                    let match = mainContentWithTypeList[idx];
                    list.push(autoBll.modules.mainContentWithType.save({
                        id: match ? match.id : null,
                        mainContentId: mainContentId,
                        mainContentType: ele.type,
                        mainContentTypeName: ele.typeName
                    }, conn));
                });
                if (mainContentWithTypeList.length > opt.mainContentTypeList.length) {
                    for (let i = opt.mainContentTypeList.length; i < mainContentWithTypeList.length; i++) {
                        let ele = mainContentWithTypeList[i];
                        list.push(autoBll.modules.mainContentWithType.del({
                            id: ele.id
                        }, conn));
                    }
                }
            }
            //删除child
            if (delChildList && delChildList.length) {
                delChildList.forEach(function (item) {
                    list.push(autoBll.modules.mainContentChild.del({ id: item.id }, conn));
                });
            }

            //保存child
            saveChildList.forEach(function (item, index) {
                item.mainContentId = mainContentId;
                item.num = index + 1;
                list.push(autoBll.modules.mainContentChild.save(item, conn));
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
            list.push(autoBll.modules.mainContentLog.save(mainContentLog, conn));
            await q.all(list);
            return mainContentId;
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
        return detailQuery({ id: mainContent.id }, exOpt);
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
        return autoBll.tran(async function (conn) {
            var now = common.dateFormat(new Date(), 'yyyy-MM-dd HH:mm:ss');
            var updateStatusOpt = {
                id: mainContent.id,
                status: mainContent.status,
                operatorId: user.id,
                operator: user.account + `(${user.nickname}#${user.id})`,
                operateDate: now
            };
            let mainContentId = await autoBll.modules.mainContent.save(updateStatusOpt, conn);

            var list = [];
            //日志
            var mainContentLog = createLog({
                id: mainContentId,
                srcStatus: mainContentDetail.mainContent.status,
                destStatus: mainContent.status,
                content: opt.remark,
                user: user,
            });
            list.push(autoBll.modules.mainContentLog.save(mainContentLog, conn));
            await q.all(list)
            return mainContentId;
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

export function updateMainContentLog(item) {
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