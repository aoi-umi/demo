import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import { getModule } from 'vuex-module-decorators';
import LoginUserStore from '@/store/loginUser';
import { dev, error } from '@/config';
import { getErrorCfgByCode } from '@/config/error';

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
            let rs = await fn();
            if (rs !== false) {
                this.$Message.success({
                    content: operate + '成功',
                    onClose: opt.onSuccessClose
                });
            }
            return true;
        } catch (e) {
            console.log(e.code, error.NotFound.code)
            if (e.code == error.NotFound.code) {
                this.toError(error.NotFound);
            } else {
                this.$Message.error(operate + '出错:' + e.message);
            }
            return false;
        }
    }

    protected isPressEnter(e: { charCode: number }) {
        return e && e.charCode === 13;
    }

    protected toError(query: { code?: string; msg?: string }) {
        this.$router.push({
            path: dev.routeConfig.error.path,
            query,
        });
    }
}