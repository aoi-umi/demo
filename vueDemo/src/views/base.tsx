import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import { getModule } from 'vuex-module-decorators';
import LoginUserStore from '@/store/loginUser';

export class Base extends Vue {
    protected get storeUser() {
        return getModule(LoginUserStore, this.$store);
    }

    protected async operateHandler(operate: string, fn: () => any, opt?: {
        onSuccessClose: () => any;
    }) {
        try {
            opt = { ...opt };
            await fn();
            this.$Message.success({
                content: operate + '成功',
                onClose: opt.onSuccessClose
            });
            return true;
        } catch (e) {
            this.$Message.error(operate + '出错:' + e.message);
            return false;
        }
    }
}