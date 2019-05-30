import Vue from 'vue';
import Router, { RouteConfig } from 'vue-router';

import { errConfig } from './config/error';

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
    component: () => import('./views/user-mgt')
  },
  role: {
    path: '/role',
    text: '角色',
    component: () => import('./views/role')
  },
  authority: {
    path: '/authority',
    text: '权限',
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
      query: { code: errConfig.NotFound.code }
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
});

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});
router.beforeEach((to, from, next) => {
  if (to.path == routerConfig.home.path) {
    next(routerConfig.bookmark.path);
  } else {
    next();
  }
});
export default router;
