import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);
type RouterConfig = {
  path: string;
  title?: string;
  component?: any;
};
export const routerConfig = {
  home: {
    path: '/',
    title: 'Home',
  },
  bookmark: {
    path: '/bookmark',
    title: '书签',
    component: () => import('./views/bookmark')
  },
  test: {
    path: '/test',
    title: 'Test',
  }
};

export const getConfigByPath = (path) => {
  for (let key in routerConfig) {
    let cfg = routerConfig[key];
    if (cfg.path == path)
      return cfg as RouterConfig;
  }
}
export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: Object.values(routerConfig),
});
