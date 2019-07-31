import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import { getModule } from 'vuex-module-decorators';
import LoginUserStore from '@/store/loginUser';

export class Base extends Vue {
    protected get storeUser() {
        return getModule(LoginUserStore, this.$store);
    }
}