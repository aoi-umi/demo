import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);
export const routerConfig = {
  home: {
    path: '/',
    title: 'Home',
  },
  test: {
    path: '/test',
    title: 'Test',
  },
  test2: {
    path: '/test2',
    title: 'Test',
  }
};

export const getConfigByPath = (path) => {
  for (let key in routerConfig) {
    let cfg = routerConfig[key];
    if (cfg.path == path)
      return cfg;
  }
}
export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    // {
    //   path: '/',
    //   name: 'home',
    //   component: Home,
    // },
    // {
    //   path: '/about',
    //   name: 'about',
    //   // route level code-splitting
    //   // this generates a separate chunk (about.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => import(/* webpackChunkName: "about" */ './views/About.vue'),
    // },
  ],
});
