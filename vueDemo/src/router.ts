import Vue from 'vue';
import Router, { RouteConfig } from 'vue-router';

import { authority, error } from './config';
import store from './store';

Vue.use(Router);
type MyRouteConfig = RouteConfig & { text?: string; };

export const routerConfig = {
  home: {
    path: '/',
    text: 'Home',
  },
  bookmark: {
    path: '/bookmark',
    text: '书签',
    component: () => import('./views/bookmark')
  },
  user: {
    path: '/userMgt',
    text: '用户',
    meta: {
      authority: [authority.Login],
    },
    component: () => import('./views/user-mgt')
  },
  userInfo: {
    path: '/user/info',
    text: '个人主页',
    meta: {
      authority: [authority.Login],
    },
    component: () => import('./views/user')
  },
  userSignIn: {
    path: '/user/signIn',
    text: '登录',
    component: () => import('./views/user').then(t => t.SignInView)
  },
  userSignUp: {
    path: '/user/signUp',
    text: '注册',
    component: () => import('./views/user-mgt')
  },
  role: {
    path: '/role',
    text: '角色',
    meta: {
      authority: [authority.Login],
    },
    component: () => import('./views/role')
  },
  authority: {
    path: '/authority',
    text: '权限',
    meta: {
      authority: [authority.Login],
    },
    component: () => import('./views/authority')
  },

  error: {
    path: '/error',
    text: '出错啦',
    component: () => import('./views/error')
  },
  notFound: {
    path: "*",
    redirect: {
      path: '/error',
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
  if (to.path == routerConfig.home.path) {
    return next(routerConfig.bookmark.path);
  }
  let auth = to.meta && to.meta.authority;
  if (auth && auth.includes(authority.Login) && !store.state.user) {
    return next(routerConfig.userSignIn);
  }
  next();

});
export default router;
