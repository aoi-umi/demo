/**
 * Created by bang on 2017-9-5.
 */
import * as q from 'q';
import * as autoBll from './_auto';
import * as common from '../_system/common';
import errorConfig from '../_system/errorConfig';
import { myEnum } from '../_main';
import * as auth from '../_system/auth';
import { isHadAuthority, authConfig } from '../_system/auth';
import { MainContentTypeModel } from '../dal/models/dbModel';
import { MainContent } from '../dal/models/dbModel/MainContent';
type MainContentTypeDataType = MainContentTypeModel.MainContentTypeDataType;
const {
    mainContentStatusEnum,
    mainContentStatusEnumOperate,
    mainContentLogTypeEnum,
    mainContentTypeEnum,
} = myEnum;

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
        let changeDesc = mainContentStatusEnum.enumChangeCheck(mainContentDetail.mainContent.status, mainContent.status);
        if (mainContent.id != 0) {
            //权限检查
            if (user.id != mainContentDetail.mainContent.userInfoId)
                throw common.error('没有权限处理此记录');
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
        let mainContentWithTypeList: MainContentTypeDataType[] = [];
        if (mainContent.id != 0) {
            let query = await autoBll.modules.mainContentWithType.query({ mainContentId: mainContent.id });
            mainContentWithTypeList = query.list;
        }

        //保存
        return autoBll.tran(async function (conn) {
            var now = common.dateFormat(new Date(), 'yyyy-MM-dd HH:mm:ss');
            mainContent.type = mainContentTypeEnum.文章;
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
            var mainContentLog = createLog({
                id: mainContentId,
                srcStatus: mainContentDetail.mainContent.status,
                destStatus: mainContent.status,
                content: opt.remark || changeDesc,
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
    var operate;
    return common.promise(function () {
        if (!mainContent.id) {
            throw common.error('', errorConfig.ARGS_ERROR);
        }
        operate = mainContent.operate;
        if (operate == 'audit')
            mainContent.status = mainContentStatusEnum.审核中;
        else if (operate == 'pass')
            mainContent.status = mainContentStatusEnum.通过;
        else if (operate == 'notPass')
            mainContent.status = mainContentStatusEnum.退回;
        else if (operate == 'del')
            mainContent.status = mainContentStatusEnum.已删除;
        else if (operate == 'recovery')
            mainContent.status = mainContentStatusEnumOperate.恢复;
        else
            throw common.error(`错误的操作类型[${operate}]`);

        necessaryAuth = 'mainContent' + common.stringToPascal(operate);
        if (!isHadAuthority(user, necessaryAuth))
            throw common.error(`没有[${necessaryAuth}]权限`);
        return detailQuery({ id: mainContent.id }, exOpt);
    }).then(function (mainContentDetail) {
        if (auth.isEqual(necessaryAuth, authConfig.mainContentDel) && !mainContentDetail.canDelete) {
            throw common.error(`没有权限`);
        }

        let changeDesc = mainContentStatusEnum.enumChangeCheck(mainContentDetail.mainContent.status, mainContent.status);
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
                content: opt.remark || changeDesc,
                user,
                operate,
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
        type: mainContentLogTypeEnum.主内容保存 as number,
        srcStatus: opt.srcStatus,
        destStatus: opt.destStatus,
        content: opt.content || '保存',
        createDate: now,
        operateDate: now,
        operatorId: user.id,
        operator: user.account + `(${user.nickname}#${user.id})`,
    };
    if (opt.operate == mainContentStatusEnumOperate.恢复) {
        mainContentLog.type = mainContentLogTypeEnum.主内容恢复;
    } else if (opt.destStatus == mainContentStatusEnum.待审核) {
        mainContentLog.type = mainContentLogTypeEnum.主内容提交;
    } else if (opt.destStatus == mainContentStatusEnum.审核中) {
        mainContentLog.type = mainContentLogTypeEnum.主内容审核;
    } else if (opt.destStatus == mainContentStatusEnum.通过) {
        mainContentLog.type = mainContentLogTypeEnum.主内容审核通过;
    } else if (opt.destStatus == mainContentStatusEnum.退回) {
        mainContentLog.type = mainContentLogTypeEnum.主内容审核不通过;
    } else if (opt.destStatus == mainContentStatusEnum.已删除) {
        mainContentLog.type = mainContentLogTypeEnum.主内容删除;
    }
    return mainContentLog;
}

function updateMainContent(item) {
    item.typeName = mainContentTypeEnum.getName(item.type);
    item.statusName = mainContentStatusEnum.getName(item.status);
}

export function updateMainContentLog(item) {
    item.typeName = mainContentLogTypeEnum.getName(item.type);
    item.srcStatusName = mainContentStatusEnum.getName(item.srcStatus);
    item.destStatusName = mainContentStatusEnum.getName(item.destStatus);
}

function canDelete(mainContent, user) {
    if (mainContent.status != -1
        && ((isHadAuthority(user, [authConfig.mainContentDel]) && (user.id == mainContent.userInfoId))
            || (isHadAuthority(user, [authConfig.admin]) && mainContent.status != mainContentStatusEnum.草稿))
    ) {
        return true;
    }
    return false;
}