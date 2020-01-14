import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import * as iview from 'iview';

import * as helpers from '@/helpers';
import { dev, myEnum } from '@/config';
import { routerConfig } from '@/router';
import { testApi, testSocket } from '@/api';
import { LocalStore } from '@/store';
import { convClass, getCompOpts } from '@/components/utils';
import { Input, Form, FormItem, Button, Checkbox, Spin, Icon, AutoComplete, Option } from '@/components/iview';
import { MyLoad } from '@/components/my-load';
import { LoginUser } from '@/model/user';

import { Base } from '../base';
import { LocalStoreUser } from './model';

import './user.less';

class SignProp {
    @Prop()
    account?: string;

    @Prop()
    by?: string;

    @Prop()
    byVal?: string;
}

type SignInDataType = {
    account?: string;
    password?: string;
};

class SignInProp extends SignProp {
}
@Component({
    extends: Base,
    mixins: [getCompOpts(SignInProp)]
})
class SignIn extends Vue<Base & SignInProp> {
    stylePrefix = 'user-sign-in-';
    private innerDetail: SignInDataType = this.getDetailData();
    private getDetailData() {
        return {
            account: '',
            password: '',
        };
    }

    private rules = {
        account: [
            { required: true, trigger: 'blur' }
        ],
        password: [
            { required: true, trigger: 'blur' }
        ],
    };

    $refs: { formVaild: iview.Form };
    private loading = false;

    protected created() {
        if (this.account)
            this.innerDetail.account = this.account;
    }
    private async handleSignIn() {
        await this.operateHandler('登录', async () => {
            this.loading = true;
            let { account, password } = this.innerDetail;
            let req = { account, rand: helpers.randStr() };
            let token = LoginUser.createToken(account, password, req);
            LocalStore.setItem(dev.cacheKey.testUser, token);
            let rs = await testApi.userSignIn(req);

            let list = LocalStoreUser.getList();
            if (!list)
                list = [];
            let remberSignIn: LocalStoreUser = { account };
            if (this.remberPwd)
                remberSignIn.password = password;
            else
                this.innerDetail.password = '';
            LocalStoreUser.updateAccount(remberSignIn, list);
            testSocket.login({ [dev.cacheKey.testUser]: token });
            this.storeUser.setUser(rs);
            this.$emit('success');
            if (this.to)
                this.$router.push({ path: this.to, query: this.toQuery });
        }, {
            validate: this.$refs.formVaild.validate
        }
        ).finally(() => {
            this.loading = false;
        });
    }

    private handlePress(e) {
        if (this.isPressEnter(e)) {
            this.handleSignIn();
        }
    }

    to = '';
    toQuery = null;
    remberPwd = false;
    signInUsers = [];
    mounted() {
        if (location.pathname === routerConfig.userSignIn.path) {
            let { to, ...query } = this.$route.query;
            this.to = (to as string) || routerConfig.index.path;
            this.toQuery = query;
        }
        let list = this.signInUsers = LocalStoreUser.getList();
        let detail = this.innerDetail;
        if (list && list.length) {
            let rs = list[0];
            if (rs.account)
                detail.account = rs.account;
            if (rs.password) {
                detail.password = rs.password;
                this.remberPwd = true;
            }
        }
    }
    render() {
        let detail = this.innerDetail;
        return (
            <div class="dialog-view" on-keypress={this.handlePress}>
                <div v-show={false}>
                    <Input placeholder="应对自动填充" />
                    <Input type="password" />
                </div>
                <h3>登录</h3>
                <br />
                <Form class="dialog-content" label-position="top" ref="formVaild" props={{ model: detail }} rules={this.rules}>
                    <FormItem label="账号" prop="account">
                        <AutoComplete v-model={detail.account} clearable on-on-select={(value) => {
                            let match = this.signInUsers.find(ele => ele.account === value);
                            detail.password = match?.password || '';
                        }}>
                            {this.signInUsers.filter(ele => !detail.account || ele.account.includes(detail.account)).map(ele => {
                                let opt = (
                                    <Option key={ele.account} value={ele.account}>
                                        <span>{ele.account}</span>
                                    </Option>
                                );
                                opt.componentOptions.tag = 'Option';
                                let icon = <Icon type="md-close" class={this.getStyleName('account-item-del')} nativeOn-click={() => {
                                    LocalStoreUser.delAccount(ele.account, this.signInUsers);
                                }} />;
                                icon.componentOptions.tag = '';
                                return (
                                    <div class={this.getStyleName('account-item')}>
                                        {opt}
                                        {icon}
                                    </div>
                                );
                            })}
                        </AutoComplete>
                    </FormItem>
                    <FormItem label="密码" prop="password">
                        <Input v-model={detail.password} type="password" clearable autocomplete="new-password" />
                    </FormItem>
                    <FormItem>
                        <label><Checkbox v-model={this.remberPwd} />记住密码</label>
                    </FormItem>
                    <FormItem>
                        <Button type="primary" long on-click={this.handleSignIn} loading={this.loading}>登录</Button>
                    </FormItem>
                    <div class={this.getStyleName('3rd-party-login')}>
                        {[{
                            src: '/logo/weixin.svg',
                            to: routerConfig.wxAuth.path,
                            query: { type: myEnum.wxAuthType.登录 }
                        }].map(ele => {
                            return <img class={this.getStyleName('3rd-party-login-item')} src={ele.src} on-click={() => {
                                this.$router.push({ path: ele.to, query: ele.query });
                                this.$emit('3rd-party-login-click');
                            }} />;
                        })}
                    </div>
                </Form>
            </div >
        );
    }
}

export const SignInView = convClass<SignInProp>(SignIn);

type SignUpDataType = {
    account: string;
    nickname: string;
    password: string;
    passwordRepeat: string;
};

class SignUpProp extends SignProp {
    @Prop()
    nickname?: string;
}
@Component({
    extends: Base,
    mixins: [getCompOpts(SignUpProp)]
})
class SignUp extends Vue<SignUpProp & Base> {
    stylePrefix = 'user-sign-up-';
    private innerDetail: SignUpDataType = this.getDetailData();
    private getDetailData() {
        return {
            account: '',
            nickname: '',
            password: '',
            passwordRepeat: '',
        };
    }

    private rules = {
        account: [
            { required: true, trigger: 'blur' },
            {
                asyncValidator: async (rule, value) => {
                    let rs = await testApi.userAccountExists({ val: value });
                    if (rs)
                        throw new Error('账号已存在');
                },
                trigger: ['changed', 'blur']
            }
        ],
        nickname: [
            { required: true, trigger: 'blur' }
        ],
        password: [
            { required: true, trigger: 'blur' }
        ],
        passwordRepeat: [{
            required: true, trigger: 'blur'
        }, {
            validator: (rule, value, callback) => {
                if (value !== this.innerDetail.password) {
                    callback(new Error('两次输入密码不一致'));
                } else {
                    callback();
                }
            },
            trigger: 'blur'
        }],
    };

    $refs: { formVaild: iview.Form };

    protected created() {
        if (this.account)
            this.innerDetail.account =
                this.innerDetail.nickname =
                this.account;
    }
    private loading = false;

    private async handleSignUp() {
        await this.operateHandler('注册', async () => {
            this.loading = true;
            let data: any = {
                ...this.innerDetail,
            };
            if (this.by)
                data.by = this.by;
            if ([myEnum.userBy.微信授权].includes(this.by)) {
                data.byVal = this.byVal;
            }

            let rs = await testApi.userSignUp(data);
            this.innerDetail = this.getDetailData();
            this.$emit('success');
            this.$router.push(routerConfig.userSignIn.path);
        }, {
            validate: this.$refs.formVaild.validate
        }
        ).finally(() => {
            this.loading = false;
        });
    }

    private handlePress(e) {
        if (this.isPressEnter(e)) {
            this.handleSignUp();
        }
    }

    render() {
        return (
            <MyLoad
                loadFn={async () => {
                    await testApi.userSignUpCheck();
                }}
                renderFn={() => { return this.renderFn(); }}
            />
        );
    }

    private renderFn() {
        let detail = this.innerDetail;
        return (
            <div class="dialog-view" on-keypress={this.handlePress}>
                <h3>注册</h3>
                <br />
                <Form class="dialog-content" label-position="top" ref="formVaild" props={{ model: detail }} rules={this.rules}>
                    <FormItem label="账号" prop="account">
                        <Input v-model={detail.account} />
                    </FormItem>
                    <FormItem label="昵称" prop="nickname">
                        <Input v-model={detail.nickname} />
                    </FormItem>
                    <FormItem label="密码" prop="password">
                        <Input v-model={detail.password} type="password" />
                    </FormItem>
                    <FormItem label="确认密码" prop="passwordRepeat">
                        <Input v-model={detail.passwordRepeat} type="password" />
                    </FormItem>
                    <FormItem>
                        <Button type="primary" long on-click={this.handleSignUp} loading={this.loading}>注册</Button>
                    </FormItem>
                </Form>
            </div >
        );
    }
}

export const SignUpView = convClass<SignUpProp>(SignUp);