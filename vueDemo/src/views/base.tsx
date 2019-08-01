import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import { getModule } from 'vuex-module-decorators';
import LoginUserStore from '@/store/loginUser';

export class Base extends Vue {
    protected get storeUser() {
        return getModule(LoginUserStore, this.$store);
    }

    protected async operateHandler(operate: string, fn: () => any, opt?: {
        onSuccessClose?: () => any;
        validate?: (callback?: (valid?: boolean) => void) => void
    }) {
        try {
            opt = { ...opt };
            let valid = await new Promise((reso, rej) => {
                if (opt.validate) {
                    opt.validate((valid) => {
                        if (!valid) {
                            this.$Message.error('参数有误');
                            reso(false);
                        } else {
                            reso(true);
                        }
                    })
                } else {
                    reso(true);
                }
            });
            if (!valid)
                return false;
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

    protected isPressEnter(e: { charCode: number }) {
        return e && e.charCode === 13;
    }
}