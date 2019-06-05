import Vue from 'vue';
import Router, { RouteConfig } from 'vue-router';

import { authority, error, dev } from './config';
import store from './store';
import { getModule } from 'vuex-module-decorators';
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
  user: {
    path: dev.routeConfig.userMgt.path,
    text: '用户',
    meta: {
      authority: dev.routeConfig.userMgt.authority,
    },
    component: () => import('./views/user-mgt')
  },
  userInfo: {
    path: dev.routeConfig.userInfo.path,
    text: '个人主页',
    meta: {
      authority: dev.routeConfig.userInfo.authority,
    },
    component: () => import('./views/user')
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
      query: { code: error.NotFound.code }
    }
  },
};

export const getConfigByPath = (path) => {
  for (let key in routerConfig) {
    let cfg = routerConfig[key];
    if (cfg.path == path)
      return cfg as MyRouteConfig;
  }
}

let routes: MyRouteConfig[] = Object.values(routerConfig);
routes.forEach(ele => {
  if (!ele.meta) {
    ele.meta = {};
  }
  if (!ele.meta.title) {
    ele.meta.title = ele.text;
  }
  // if (ele.component) {
  //   let component: any = ele.component;
  //   ele.component = () => {
  //     let auth = ele.meta && ele.meta.authority;
  //     if (auth && auth.includes(authority.Login) && !store.state.user) {
  //       return import('./views/user').then(t => t.SignInView);
  //     }
  //     return typeof component === 'function' ? component() : component;
  //   }
  // }
});

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});
router.beforeEach((to, from, next) => {
  if (to.path == routerConfig.index.path) {
    return next(routerConfig.bookmark.path);
  }
  let auth = to.meta && to.meta.authority;
  let mod = getModule(LoginUserStore, store);
  if (auth && auth.includes(authority.Login) && !mod.user) {
    return next({ path: routerConfig.userSignIn.path, query: { to: to.path, ...to.query } });
  }
  next();

});
export default router;
