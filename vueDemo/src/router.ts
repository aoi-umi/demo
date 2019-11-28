import Vue from 'vue';
import Router, { RouteConfig } from 'vue-router';
import { getModule } from 'vuex-module-decorators';
import iview from "iview";
const ViewUI = iview as any;

import { authority, error, dev } from './config';
import store from './store';
import LoginUserStore from './store/login-user';

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
            // authority: [authority.login],
        },
        component: () => import('./views/user/user')
    },
    userChat: {
        path: '/user/chat',
        text: '私信',
        meta: {
            authority: [authority.login],
        },
        component: () => import('./views/user/user-chat')
    },
    userSignIn: {
        path: '/user/signIn',
        text: '登录',
        component: () => import('./views/user/user-sign').then(t => t.SignInView)
    },
    userSignUp: {
        path: '/user/signUp',
        text: '注册',
        component: () => import('./views/user/user-sign').then(t => t.SignUpView)
    },

    goods: {
        path: '/goods',
        text: '商品',
        component: () => import('./views/goods/goods'),
    },
    goodsDetail: {
        path: '/goods/detail',
        text: '商品',
        component: () => import('./views/goods/goods-detail'),
    },
    goodsMgt: {
        path: '/goodsMgt',
        text: '商品管理',
        component: () => import('./views/goods/goods-mgt'),
        meta: {
            authority: [authority.login],
        },
    },
    goodsMgtEdit: {
        path: '/goodsMgt/edit',
        text: '商品管理',
        component: () => import('./views/goods/goods-mgt-detail'),
        meta: {
            authority: [authority.login],
        },
    },
    goodsMgtDetail: {
        path: '/goodsMgt/detail',
        text: '商品管理',
        component: () => import('./views/goods/goods-mgt-detail'),
        meta: {
            authority: [authority.login],
        },
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
        component: () => import('./views/user/user-mgt')
    },
    role: {
        path: adminPath + '/roleMgt',
        text: '角色',
        meta: {
            authority: [authority.login, authority.roleQuery],
        },
        component: () => import('./views/system/role')
    },
    authority: {
        path: adminPath + '/authorityMgt',
        text: '权限',
        meta: {
            authority: [authority.login, authority.authorityQuery],
        },
        component: () => import('./views/system/authority')
    },
    setting: {
        path: adminPath + '/setting',
        text: '系统设置',
        meta: {
            authority: [authority.login, authority.settingQuery],
        },
        component: () => import('./views/system/setting')
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
        component: () => import('./views/content/content-mgt')
    },

    article: {
        path: '/article',
        text: '文章',
        component: () => import('./views/content/article')
    },
    articleDetail: {
        path: '/article/detail',
        text: '文章',
        component: () => import('./views/content/article-detail')
    },
    articleMgtEdit: {
        path: '/contentMgt/article/edit',
        text: '编辑文章',
        meta: {
            authority: [authority.login],
        },
        component: () => import('./views/content/article-mgt-detail')
    },
    articleMgtDetail: {
        path: '/contentMgt/article/detail',
        text: '查看文章',
        meta: {
            authority: [authority.login],
        },
        component: () => import('./views/content/article-mgt-detail')
    },

    video: {
        path: '/video',
        text: '视频',
        component: () => import('./views/content/video')
    },
    videoDetail: {
        path: '/video/detail',
        text: '视频',
        component: () => import('./views/content/video-detail')
    },
    videoMgtEdit: {
        path: '/contentMgt/video/edit',
        text: '编辑视频',
        meta: {
            authority: [authority.login],
        },
        component: () => import('./views/content/video-mgt-detail')
    },
    videoMgtDetail: {
        path: '/contentMgt/video/detail',
        text: '查看视频',
        meta: {
            authority: [authority.login],
        },
        component: () => import('./views/content/video-mgt-detail')
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
    waterfall: {
        path: '/waterfall',
        text: '落地',
        component: () => import('./views/waterfall')
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
    ViewUI.LoadingBar.start();
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
router.afterEach(route => {
    ViewUI.LoadingBar.finish();
});
export default router;
