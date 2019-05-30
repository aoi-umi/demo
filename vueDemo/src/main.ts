import Vue from 'vue';
import iView from 'iview';
import 'iview/dist/styles/iview.css';
Vue.use(iView);
import App from './App';
import router from './router';
import store from './store';
import config from './config/env';

Vue.config.productionTip = false;
document.title = config.title;
new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
