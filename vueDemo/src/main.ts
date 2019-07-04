import Vue from 'vue';
import iView from 'iview';
import 'iview/dist/styles/iview.css';
import VueQuillEditor from 'vue-quill-editor';
import 'quill/dist/quill.core.css';
import 'quill/dist/quill.snow.css';
import 'quill/dist/quill.bubble.css';

Vue.use(iView);
Vue.use(VueQuillEditor);
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
