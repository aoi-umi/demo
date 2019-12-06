import Vue from 'vue';
import Vuex, { Store } from 'vuex';

import LoginUserStore from './login-user';
import SettingStore from './setting';

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        user: LoginUserStore,
        setting: SettingStore
    },
});

export * from './local-store';


declare module "vue/types/vue" {
    interface Vue {
        storeUser: LoginUserStore;
        storeSetting: SettingStore;
    }
}

import { getModule } from 'vuex-module-decorators';
Vue.use({
    install: function (Vue) {
        Object.defineProperties(Vue.prototype, {
            storeUser: {
                get() {
                    return getModule(LoginUserStore, this.$store)
                }
            },
            storeSetting: {
                get() {
                    return getModule(SettingStore, this.$store)
                }
            },
        });
    }
});
