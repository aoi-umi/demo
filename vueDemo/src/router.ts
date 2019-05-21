import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);
type RouterConfig = {
  path: string;
  text: string;
  meta?: {
    title?: string;
  }
  component?: any;
};
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
  test: {
    path: '/test',
    text: 'Test',
  }
};

export const getConfigByPath = (path) => {
  for (let key in routerConfig) {
    let cfg = routerConfig[key];
    if (cfg.path == path)
      return cfg as RouterConfig;
  }
}

let routes: RouterConfig[] = Object.values(routerConfig);
routes.forEach(ele => {
  if (!ele.meta) {
    ele.meta = {};
  }
  if (!ele.meta.title) {
    ele.meta.title = ele.text;
  }
});
export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
});
