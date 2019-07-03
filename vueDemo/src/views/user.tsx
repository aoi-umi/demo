import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import { Form as IForm } from 'iview';
import { getModule } from 'vuex-module-decorators';
import moment from 'moment';

import { convClass } from '@/helpers';
import * as helpers from '@/helpers';
import { dev } from '@/config';
import { testApi } from '@/api';
import { Tag, Modal, Input, Row, Col, Form, FormItem, Button, Spin, Card } from '@/components/iview';
import LoginUserStore from '@/store/loginUser';
import { MyTagModel } from '@/components/my-tag';
import { DetailDataType as UserDetailDataType } from './user-mgt';


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

    $refs: { formVaild: IForm };
    get storeUser() {
        return getModule(LoginUserStore, this.$store);
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
            this.storeUser.setUser(rs);
            this.innerDetail = this.getDetailData();
            this.$emit('success');
            if (this.to)
                this.$router.push({ path: this.to, query: this.toQuery });
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
        this.$refs.formVaild.validate((valid) => {
            if (!valid) {
                this.$Message.error('参数有误');
            } else {
                this.signIn();
            }
        });
    }

    to = '';
    toQuery = null;
    mounted() {
        if (location.pathname === dev.routeConfig.userSignIn.path) {
            let { to, ...query } = this.$route.query;
            this.to = (to as string) || dev.routeConfig.index.path;
            this.toQuery = query;
        }
    }
    render() {
        let detail = this.innerDetail;
        return (
            <div class="dialog-view" on-keypress={this.handlePress}>
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
                    callback(new Error('两次输入密码不一致'));
                } else {
                    callback();
                }
            },
            trigger: 'blur'
        }],
    };

    $refs: { formVaild: IForm };

    private loading = false;

    private async signUp() {
        try {
            let rs = await testApi.userSignUp(this.innerDetail);
            this.innerDetail = this.getDetailData();
            this.$emit('success');
            this.$Message.success('注册成功');
            this.$router.push(dev.routeConfig.userSignIn.path);
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
        this.$refs.formVaild.validate((valid) => {
            if (!valid) {
                this.$Message.error('参数有误');
            } else {
                this.signUp();
            }
        });
    }

    render() {
        let detail = this.innerDetail;
        return (
            <div class="dialog-view" on-keypress={this.handlePress}>
                <h3>注册</h3>
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
                        <Button type="primary" long on-click={this.handleSignUp} loading={this.loading}>注册</Button>
                    </FormItem>
                </Form>
            </div >
        );
    }
}

export const SignUpView = convClass<SignUp>(SignUp);
@Component
export default class UserInfo extends Vue {
    get storeUser() {
        return getModule(LoginUserStore, this.$store);
    }
    loading = false;
    detail: UserDetailDataType = {
        auth: {}
    };
    mounted() {
        this.getUserDetail();
    }

    async getUserDetail() {
        if (!this.detail._id) {
            this.loading = true;
            try {
                this.detail = await testApi.userDetail();
                if (!this.detail)
                    throw new Error('用户不存在');
            } catch (e) {
                this.$router.push({ path: dev.routeConfig.error.path, query: { msg: '获取用户出错:' + e.message } });
            } finally {
                this.loading = false;
            }
        }
    }

    render() {
        return (
            <div style={{ position: 'relative', }}>
                <Card>
                    <Form label-width={60}>
                        <FormItem label="账号">
                            {this.detail.account}
                        </FormItem>
                        <FormItem label="昵称">
                            {this.detail.nickname}
                        </FormItem>
                        <FormItem label="角色">
                            {MyTagModel.renderRoleTag(this.detail.roleList)}
                        </FormItem>
                        <FormItem label="权限">
                            {MyTagModel.renderAuthorityTag(this.detail.authorityList)}
                        </FormItem>
                        <FormItem label="可用权限">
                            {MyTagModel.renderAuthorityTag(Object.values(this.detail.auth))}
                        </FormItem>
                        <FormItem label="创建时间">
                            {this.detail.createdAt && moment(this.detail.createdAt).format(dev.dateFormat)}
                        </FormItem>
                        <FormItem label="状态">
                            {this.detail.statusText}
                        </FormItem>
                    </Form>
                </Card>
                {this.loading && <Spin size="large" fix></Spin>}
            </div>
        );
    }
}
