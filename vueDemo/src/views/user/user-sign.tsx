import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import * as iview from 'iview';

import * as helpers from '@/helpers';
import { dev, myEnum } from '@/config';
import { routerConfig } from '@/router';
import { testApi, testSocket } from '@/api';
import { convClass } from '@/components/utils';
import { Input, Form, FormItem, Button } from '@/components/iview';
import { LoginUser } from '@/model/user';

import { Base } from '../base';
import { MyLoad } from '@/components/my-load';


type SignInDataType = {
    account?: string;
    password?: string;
};

@Component
class SignIn extends Base {

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

    private async handleSignIn() {
        await this.operateHandler('登录', async () => {
            this.loading = true;
            let { account, password } = this.innerDetail;
            let req = { account, rand: helpers.randStr() };
            let token = LoginUser.createToken(account, password, req);
            localStorage.setItem(dev.cacheKey.testUser, token);
            let rs = await testApi.userSignIn(req);
            testSocket.login({ [dev.cacheKey.testUser]: token });
            this.storeUser.setUser(rs);
            this.innerDetail = this.getDetailData();
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
    mounted() {
        if (location.pathname === routerConfig.userSignIn.path) {
            let { to, ...query } = this.$route.query;
            this.to = (to as string) || routerConfig.index.path;
            this.toQuery = query;
        }
    }
    render() {
        let detail = this.innerDetail;
        return (
            <div class="dialog-view" on-keypress={this.handlePress}>
                <h3>登录</h3>
                <br />
                <Form class="dialog-content" label-position="top" ref="formVaild" props={{ model: detail }} rules={this.rules}>
                    <FormItem label="账号" prop="account">
                        <Input v-model={detail.account} />
                    </FormItem>
                    <FormItem label="密码" prop="password">
                        <Input v-model={detail.password} type="password" />
                    </FormItem>
                    <FormItem>
                        <Button type="primary" long on-click={this.handleSignIn} loading={this.loading}>登录</Button>
                    </FormItem>
                </Form>
            </div >
        );
    }
}

export const SignInView = convClass<SignIn>(SignIn);

type SignUpDataType = {
    account: string;
    nickname: string;
    password: string;
    passwordRepeat: string;
}

@Component
class SignUp extends Base {

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
            { required: true, trigger: 'blur' }
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

    private loading = false;

    private async handleSignUp() {
        await this.operateHandler('注册', async () => {
            this.loading = true;
            let rs = await testApi.userSignUp(this.innerDetail);
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
        )
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

export const SignUpView = convClass<SignUp>(SignUp);