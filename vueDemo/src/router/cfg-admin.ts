import { authority } from '../config';

let adminPath = '/admin';

export default {
    admin: {
        path: adminPath,
        text: '管理',
        meta: {
            authority: [authority.login],
        },
    },

    userMgt: {
        path: adminPath + '/userMgt',
        text: '用户',
        meta: {
            authority: [authority.login, authority.userMgtQuery],
        },
        component: () => import('../views/user/user-mgt')
    },
    role: {
        path: adminPath + '/roleMgt',
        text: '角色',
        meta: {
            authority: [authority.login, authority.roleQuery],
        },
        component: () => import('../views/system/role')
    },
    authority: {
        path: adminPath + '/authorityMgt',
        text: '权限',
        meta: {
            authority: [authority.login, authority.authorityQuery],
        },
        component: () => import('../views/system/authority')
    },
    setting: {
        path: adminPath + '/setting',
        text: '系统设置',
        meta: {
            authority: [authority.login, authority.settingQuery],
        },
        component: () => import('../views/system/setting')
    },
    assetMgt: {
        path: adminPath + '/assetMgt',
        text: '资金',
        meta: {
            authority: [authority.login, authority.payMgtQuery],
        },
        component: () => import('../views/asset-mgt')
    },
    assetMgtLog: {
        path: adminPath + '/assetMgt/log',
        text: '资金记录',
        meta: {
            authority: [authority.login, authority.payMgtQuery],
        },
        component: () => import('../views/asset-mgt').then(t => t.AssetMgtLog)
    },
    assetMgtNotify: {
        path: adminPath + '/assetMgt/notify',
        text: '回调通知',
        meta: {
            authority: [authority.login, authority.payMgtQuery],
        },
        component: () => import('../views/asset-mgt').then(t => t.AssetMgtNotify)
    },
};