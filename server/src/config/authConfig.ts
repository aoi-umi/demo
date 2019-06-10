
import errorConfig from './errorConfig';
export type AuthConfigType = {
    code: string;
    errCode?: ErrorConfigType;
}
export const authConfig = {
    dev: {
        code: 'dev',
        errCode: errorConfig.DEV,
    },
    local: {
        code: 'local',
        errCode: errorConfig.NO_PERMISSIONS,
    },
    login: {
        code: 'login',
        errCode: errorConfig.NO_LOGIN,
    },
    accessable: {
        code: 'accessable',
        errCode: errorConfig.NO_PERMISSIONS,
    },
    admin: {
        code: 'admin',
        errCode: errorConfig.NO_PERMISSIONS,
    },

    userMgtQuery: {
        code: 'userMgtQuery',
    },
    userMgtEdit: {
        code: 'userMgtEdit',
    },

    roleQuery: {
        code: 'roleQuery',
    },
    roleSave: {
        code: 'roleSave',
    },
    roleDel: {
        code: 'roleDel',
    },
    authorityQuery: {
        code: 'authorityQuery',
    },
    authoritySave: {
        code: 'authorityQuery',
    },
    authorityDel: {
        code: 'authorityDel',
    },

    mainContentQuery: {
        code: 'mainContentQuery'
    },
    mainContentDetailQuery: {
        code: 'mainContentDetailQuery'
    },
    mainContentSave: {
        code: 'mainContentSave'
    },
    mainContentDel: {
        code: 'mainContentDel'
    },
    mainContentAudit: {
        code: 'mainContentAudit'
    },
    mainContentPass: {
        code: 'mainContentPass'
    },
    mainContentNotPass: {
        code: 'mainContentNotPass'
    },
    mainContentRecovery: {
        code: 'mainContentRecovery'
    },
    mainContentUntread: {
        code: 'mainContentUntread'
    },

    mainContentTypeQuery: {
        code: 'mainContentTypeQuery'
    },
    mainContentTypeDetailQuery: {
        code: 'mainContentTypeDetailQuery'
    },
    mainContentTypeSave: {
        code: 'mainContentTypeSave'
    },
    mainContentTypeDel: {
        code: 'mainContentTypeDel'
    }
};