import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import { getModule } from 'vuex-module-decorators';
import LoginUserStore from '@/store/loginUser';
import { dev, error } from '@/config';

export class Base extends Vue {
    protected get storeUser() {
        return getModule(LoginUserStore, this.$store);
    }

    protected async operateHandler(operate: string, fn: () => any, opt?: {
        onSuccessClose?: () => any;
        validate?: (callback?: (valid?: boolean) => void) => void,
        noDefaultHandler?: boolean;
    }) {
        let result = {
            success: true,
            msg: '',
            err: null
        };
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
            if (!valid) {
                result.success = false;
                result.msg = '参数有误';
                return result;
            }
            await fn();
            if (!opt.noDefaultHandler) {
                this.$Message.success({
                    content: operate + '成功',
                    onClose: opt.onSuccessClose
                });
            }
            return result;
        } catch (e) {
            result.success = false;
            result.msg = e.message;
            result.err = e;
            if (!opt.noDefaultHandler) {
                if (e.code == error.NotFound.code) {
                    this.toError(error.NotFound);
                } else {
                    this.$Message.error(operate + '出错:' + e.message);
                }
            }
            return result;
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