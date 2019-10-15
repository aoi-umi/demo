import Vue from 'vue';
import Router, { RouteConfig } from 'vue-router';
import { getModule } from 'vuex-module-decorators';

import { authority, error, dev } from './config';
import store from './store';
import LoginUserStore from './store/loginUser';

Vue.use(Router);
type MyRouteConfig = RouteConfig & { text?: string; };


let adminPath = '/admin';
let errPath = '/error';
export const routerConfig = {
    index: {
        path: '/',
        text: 'Home',
    },
    bookmark: {
        path: '/bookmark',
        text: '书签',
        component: () => import('./views/bookmark')
    },
    userInfo: {
        path: '/user/info',
        text: '个人主页',
        meta: {
            authority: [authority.login],
        },
        component: () => import('./views/user')
    },
    userChat: {
        path: '/user/chat',
        text: '私信',
        meta: {
            authority: [authority.login],
        },
        component: () => import('./views/user-chat')
    },
    userSignIn: {
        path: '/user/signIn',
        text: '登录',
        component: () => import('./views/user-sign').then(t => t.SignInView)
    },
    userSignUp: {
        path: '/user/signUp',
        text: '注册',
        component: () => import('./views/user-sign').then(t => t.SignUpView)
    },

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
        component: () => import('./views/user-mgt')
    },
    role: {
        path: adminPath + '/roleMgt',
        text: '角色',
        meta: {
            authority: [authority.login, authority.roleQuery],
        },
        component: () => import('./views/role')
    },
    authority: {
        path: adminPath + '/authorityMgt',
        text: '权限',
        meta: {
            authority: [authority.login, authority.authorityQuery],
        },
        component: () => import('./views/authority')
    },
    assetMgt: {
        path: adminPath + '/assetMgt',
        text: '资金',
        meta: {
            authority: [authority.login, authority.payMgtQuery],
        },
        component: () => import('./views/asset-mgt')
    },
    assetMgtLog: {
        path: adminPath + '/assetMgt/log',
        text: '资金记录',
        meta: {
            authority: [authority.login, authority.payMgtQuery],
        },
        component: () => import('./views/asset-mgt').then(t => t.AssetMgtLog)
    },
    assetMgtNotify: {
        path: adminPath + '/assetMgt/notify',
        text: '回调通知',
        meta: {
            authority: [authority.login, authority.payMgtQuery],
        },
        component: () => import('./views/asset-mgt').then(t => t.AssetMgtNotify)
    },

    contentMgt: {
        path: '/contentMgt',
        text: '投稿管理',
        meta: {
            authority: [authority.login],
        },
        component: () => import('./views/content-mgt')
    },

    article: {
        path: '/article',
        text: '文章',
        component: () => import('./views/article')
    },
    articleDetail: {
        path: '/articleMgt/detail',
        text: '文章',
        component: () => import('./views/article-detail')
    },
    articleMgtEdit: {
        path: '/articleMgt/edit',
        text: '编辑文章',
        meta: {
            authority: [authority.login],
        },
        component: () => import('./views/article-mgt-detail')
    },
    articleMgtDetail: {
        path: '/articleMgt/detail',
        text: '查看文章',
        meta: {
            authority: [authority.login],
        },
        component: () => import('./views/article-mgt-detail')
    },

    video: {
        path: '/video',
        text: '视频',
        component: () => import('./views/video')
    },
    videoDetail: {
        path: '/video',
        text: '视频',
        component: () => import('./views/article-detail')
    },
    videoMgtEdit: {
        path: '/video',
        text: '编辑管理',
        meta: {
            authority: [authority.login],
        },
        component: () => import('./views/article-mgt-detail')
    },
    videoMgtDetail: {
        path: '/video',
        text: '查看文章',
        meta: {
            authority: [authority.login],
        },
        component: () => import('./views/article-mgt-detail')
    },

    payMgt: {
        path: '/payMgt',
        text: '支付',
        meta: {
            authority: [authority.login],
        },
        component: () => import('./views/pay-mgt')
    },

    test: {
        path: '/test',
        text: '测试',
        component: () => import('./views/demo')
    },

    error: {
        path: errPath,
        text: '出错啦',
        component: () => import('./views/error')
    },
    notFound: {
        path: "*",
        redirect: {
            path: errPath,
            query: { code: error.NOT_FOUND.code }
        }
    },
};

export const getConfigByPath = (path) => {
    for (let key in routerConfig) {
        let cfg = routerConfig[key];
        if (cfg.path == path)
            return cfg as MyRouteConfig;
    }
};

let routes: MyRouteConfig[] = Object.values(routerConfig);
routes.forEach(ele => {
    if (!ele.meta) {
        ele.meta = {};
    }
    if (!ele.meta.title) {
        ele.meta.title = ele.text;
    }
});

const router = new Router({
    mode: 'history',
    base: process.env.BASE_URL,
    routes,
});
router.beforeEach((to, from, next) => {
    if (to.path == routerConfig.index.path) {
        return next(routerConfig.article.path);
    }
    let auth = to.meta && to.meta.authority;
    let userMod = getModule(LoginUserStore, store);
    if (auth && auth.includes(authority.login) && !userMod.user.isLogin) {
        return next({ path: routerConfig.userSignIn.path, query: { to: to.path, ...to.query } });
    }
    next();

});
export default router;
