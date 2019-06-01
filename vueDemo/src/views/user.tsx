import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import { Form as IForm } from 'iview';
import { convClass } from '@/helpers';
import * as helpers from '@/helpers';
import { dev } from '@/config';
import { testApi } from '@/api';
import { Tag, Modal, Input, Row, Col, Form, FormItem, Button } from '@/components/iview';
import { routeConfig } from '@/config/config';

type SignInDataType = {
    account?: string;
    password?: string;
}

@Component
class SignIn extends Vue {

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

    private get innerRefs() {
        return this.$refs as { formVaild: IForm }
    }

    private loading = false;

    private async signIn() {
        try {
            let { account, password } = this.innerDetail;
            let req = { account, rand: helpers.randStr() };
            let token = req.account + helpers.md5(password) + JSON.stringify(req);
            token = helpers.md5(token);
            localStorage.setItem(dev.cacheKey.testUser, token);
            let rs = await testApi.userSignIn(req);
            this.$store.commit('setUser', rs);
            this.innerDetail = this.getDetailData();
            this.$emit('success');
            if (this.to)
                this.$router.push(this.to);
        } catch (e) {
            this.$Message.error(e.message);
        }
    }

    private handlePress(e) {
        if (e.charCode == 13) {
            this.handleSignIn();
        }
    }

    private handleSignIn() {
        this.innerRefs.formVaild.validate((valid) => {
            if (!valid) {
                this.$Message.error('参数有误');
            } else {
                this.signIn();
            }
        })
    }

    to = '';
    mounted() {
        if (location.pathname === routeConfig.userSignIn.path) {
            this.to = (this.$route.query.to as string) || routeConfig.index.path;
        }
    }
    render() {
        let detail = this.innerDetail;
        return (
            <div on-keypress={this.handlePress}>
                <h3>登录</h3>
                <br />
                <Form label-width={50} ref="formVaild" props={{ model: detail }} rules={this.rules}>
                    <FormItem label="账号" prop="account">
                        <Input v-model={detail.account} />
                    </FormItem>
                    <FormItem label="密码" prop="password">
                        <Input v-model={detail.password} type="password" />
                    </FormItem>
                    <FormItem>
                        <Button type="primary" on-click={this.handleSignIn} loading={this.loading}>登录</Button>
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
class SignUp extends Vue {

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
                    callback(new Error('两次输入密码不一致'))
                } else {
                    callback()
                }
            },
            trigger: 'blur'
        }],
    };

    private get innerRefs() {
        return this.$refs as { formVaild: IForm }
    }

    private loading = false;

    private async signUp() {
        try {
            let rs = await testApi.userSignUp(this.innerDetail);
            this.innerDetail = this.getDetailData();
            this.$emit('success');
            this.$Message.success('注册成功');
            this.$router.push(routeConfig.userSignIn.path);
        } catch (e) {
            this.$Message.error(e.message);
        }
    }

    private handlePress(e) {
        if (e.charCode == 13) {
            this.handleSignUp();
        }
    }

    private handleSignUp() {
        this.innerRefs.formVaild.validate((valid) => {
            if (!valid) {
                this.$Message.error('参数有误');
            } else {
                this.signUp();
            }
        })
    }

    render() {
        let detail = this.innerDetail;
        return (
            <div on-keypress={this.handlePress}>
                <h3>登录</h3>
                <br />
                <Form label-width={100} ref="formVaild" props={{ model: detail }} rules={this.rules}>
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
                        <Button type="primary" on-click={this.handleSignUp} loading={this.loading}>注册</Button>
                    </FormItem>
                </Form>
            </div >
        );
    }
}

export const SignUpView = convClass<SignUp>(SignUp);
@Component
export default class UserInfo extends Vue {
    render() {
        return (
            <div>
                <Form label-width={50}>
                    <FormItem label="账号" prop="account">
                        {this.$store.state.user.account}
                    </FormItem>
                    <FormItem label="昵称" prop="nickname">
                        {this.$store.state.user.nickname}
                    </FormItem>
                </Form>
            </div>
        );
    }
}
