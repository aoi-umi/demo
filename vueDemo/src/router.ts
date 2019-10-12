import Vue from 'vue';
import Router, { RouteConfig } from 'vue-router';
import { getModule } from 'vuex-module-decorators';

import { authority, error, dev } from './config';
import store from './store';
import LoginUserStore from './store/loginUser';

Vue.use(Router);
type MyRouteConfig = RouteConfig & { text?: string; };

export const routerConfig = {
    index: {
        path: dev.routeConfig.index.path,
        text: 'Home',
    },
    bookmark: {
        path: '/bookmark',
        text: '书签',
        component: () => import('./views/bookmark')
    },
    userInfo: {
        path: dev.routeConfig.userInfo.path,
        text: '个人主页',
        meta: {
            authority: dev.routeConfig.userInfo.authority,
        },
        component: () => import('./views/user')
    },
    userChat: {
        path: dev.routeConfig.userChat.path,
        text: '私信',
        meta: {
            authority: dev.routeConfig.userChat.authority,
        },
        component: () => import('./views/user-chat')
    },
    userSignIn: {
        path: dev.routeConfig.userSignIn.path,
        text: '登录',
        component: () => import('./views/user').then(t => t.SignInView)
    },
    userSignUp: {
        path: dev.routeConfig.userSignUp.path,
        text: '注册',
        component: () => import('./views/user').then(t => t.SignUpView)
    },

    admin: {
        path: dev.routeConfig.admin.path,
        text: '管理',
        meta: {
            authority: dev.routeConfig.admin.authority,
        },
    },

    userMgt: {
        path: dev.routeConfig.userMgt.path,
        text: '用户',
        meta: {
            authority: dev.routeConfig.userMgt.authority,
        },
        component: () => import('./views/user-mgt')
    },
    role: {
        path: dev.routeConfig.role.path,
        text: '角色',
        meta: {
            authority: dev.routeConfig.role.authority,
        },
        component: () => import('./views/role')
    },
    authority: {
        path: dev.routeConfig.authority.path,
        text: '权限',
        meta: {
            authority: dev.routeConfig.authority.authority,
        },
        component: () => import('./views/authority')
    },
    assetMgt: {
        path: dev.routeConfig.assetMgt.path,
        text: '资金',
        meta: {
            authority: dev.routeConfig.assetMgt.authority,
        },
        component: () => import('./views/asset-mgt')
    },
    assetMgtLog: {
        path: dev.routeConfig.assetMgtLog.path,
        text: '资金记录',
        meta: {
            authority: dev.routeConfig.assetMgtLog.authority,
        },
        component: () => import('./views/asset-mgt').then(t => t.AssetMgtLog)
    },
    assetMgtNotify: {
        path: dev.routeConfig.assetMgtNotify.path,
        text: '回调通知',
        meta: {
            authority: dev.routeConfig.assetMgtNotify.authority,
        },
        component: () => import('./views/asset-mgt').then(t => t.AssetMgtNotify)
    },

    article: {
        path: dev.routeConfig.article.path,
        text: '文章',
        component: () => import('./views/article')
    },
    articleDetail: {
        path: dev.routeConfig.articleDetail.path,
        text: '文章',
        component: () => import('./views/article-detail')
    },
    articleMgt: {
        path: dev.routeConfig.articleMgt.path,
        text: '文章管理',
        meta: {
            authority: dev.routeConfig.articleMgt.authority,
        },
        component: () => import('./views/article-mgt')
    },
    articleMgtEdit: {
        path: dev.routeConfig.articleMgtEdit.path,
        text: '编辑文章',
        meta: {
            authority: dev.routeConfig.articleMgtEdit.authority,
        },
        component: () => import('./views/article-mgt-detail')
    },
    articleMgtDetail: {
        path: dev.routeConfig.articleMgtDetail.path,
        text: '查看文章',
        meta: {
            authority: dev.routeConfig.articleMgtDetail.authority,
        },
        component: () => import('./views/article-mgt-detail')
    },

    video: {
        path: dev.routeConfig.video.path,
        text: '视频',
        component: () => import('./views/article')
    },
    videoDetail: {
        path: dev.routeConfig.articleDetail.path,
        text: '视频',
        component: () => import('./views/article-detail')
    },
    videoMgtEdit: {
        path: dev.routeConfig.articleMgtEdit.path,
        text: '编辑文章',
        meta: {
            authority: dev.routeConfig.articleMgtEdit.authority,
        },
        component: () => import('./views/article-mgt-detail')
    },
    videoMgtDetail: {
        path: dev.routeConfig.articleMgtDetail.path,
        text: '查看文章',
        meta: {
            authority: dev.routeConfig.articleMgtDetail.authority,
        },
        component: () => import('./views/article-mgt-detail')
    },

    payMgt: {
        path: dev.routeConfig.payMgt.path,
        text: '支付',
        meta: {
            authority: dev.routeConfig.payMgt.authority,
        },
        component: () => import('./views/pay-mgt')
    },

    test: {
        path: '/test',
        text: '测试',
        component: () => import('./views/demo')
    },

    error: {
        path: dev.routeConfig.error.path,
        text: '出错啦',
        component: () => import('./views/error')
    },
    notFound: {
        path: "*",
        redirect: {
            path: dev.routeConfig.error.path,
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
