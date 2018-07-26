import * as common from '../_system/common';
import * as mainContentDal from '../dal/mainContent';
import * as authorityDal from '../dal/authority';
import * as logDal from '../dal/log';
import * as roleDal from '../dal/role';
import * as userInfoDal from '../dal/userInfo';
import * as userInfoWithStructDal from '../dal/userInfoWithStruct';

export class mainContent {
    static query(params, conn?) {
        return common.promise(async () => {
            let t = await mainContentDal.query(params, conn);
            var detail = {
                list: t[0],
                count: t[1][0].count,
                statusList: t[2]
            };
            return detail;
        });
    }

    static detailQuery(params, conn?) {
        return common.promise(async () => {
            let t = await mainContentDal.detailQuery(params, conn);
            let detail = {
                mainContent: t[0][0],
                mainContentTypeList: t[1],
                mainContentChildList: t[2],
                mainContentLogList: t[3]
            }
            return detail;
        });
    }
}

export class authority {
    static query(params, conn?) {
        return common.promise(async () => {
            let t = await authorityDal.query(params, conn);
            return {
                list: t[0],
                count: t[1][0].count,
            };
        });
    }
}

export class log {
    static query(params, conn?) {
        return common.promise(async () => {
            let t = await logDal.query(params, conn);
            return {
                list: t[0],
                count: t[1][0].count,
            };
        });
    }

    static statistics(params, conn?) {
        return common.promise(async () => {
            let t = await logDal.statistics(params, conn);
            return {
                list: t[0]
            };
        });
    }
}

export class role {
    static query(params, conn?) {
        return common.promise(async () => {
            let t = await roleDal.query(params, conn);
            return {
                list: t[0],
                count: t[1][0].count,
                roleWithAuthorityList: t[2],
                authorityList: t[3],
            };
        });
    }

    static detailQuery(params, conn?) {
        return common.promise(async () => {
            let t = await roleDal.detailQuery(params, conn);
            return {
                role: t[0][0],
                authorityList: t[1],
            };
        });
    }
}

export class userInfo {
    static query(params, conn?) {
        return common.promise(async () => {
            let t = await userInfoDal.query(params, conn);
            return {
                list: t[0],
                count: t[1][0].count,
                userInfoWithAuthorityList: t[2],
                authorityList: t[3],
                userInfoWithRoleList: t[4],
                roleList: t[5],
                roleAuthorityList: t[6],
            };
        });
    }

    static detailQuery(params, conn?) {
        return common.promise(async () => {
            let t = await userInfoDal.detailQuery(params, conn);
            return {
                userInfo: t[0][0],
                userInfoLog: t[1],
                authorityList: t[2],
                roleList: t[3],
                roleAuthorityList: t[4],
                structList: t[5]
            };
        });
    }
}

export class userInfoWithStruct {
    static query(params, conn?) {
        return common.promise(async () => {
            let t = await userInfoWithStructDal.query(params, conn);
            return {
                list: t[0],
                count: t[1][0].count,
            };
        });
    }
}