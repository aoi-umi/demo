import Vue from 'vue';
import iView from 'iview';
import 'iview/dist/styles/iview.css';
Vue.use(iView);
import App from './App';
import router from './router';
import store from './store';
import { env } from './config';

Vue.config.productionTip = false;
document.title = env.title;
new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
