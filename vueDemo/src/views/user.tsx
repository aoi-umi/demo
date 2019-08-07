import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import { Form as IForm } from 'iview';
import moment from 'moment';

import { convClass } from '@/helpers';
import * as helpers from '@/helpers';
import { dev } from '@/config';
import { testApi } from '@/api';
import { Tag, Modal, Input, Row, Col, Form, FormItem, Button, Spin, Card } from '@/components/iview';
import { MyTagModel } from '@/components/my-tag';
import { LoginUser } from '@/model/user';
import { DetailDataType as UserDetailDataType } from './user-mgt';
import { Base } from './base';
import { LoadView, ILoadView } from './load-view';
import { UserAvatarView } from './user-avatar';


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

    $refs: { formVaild: IForm };
    private loading = false;

    private async handleSignIn() {
        await this.operateHandler('登录', async () => {
            this.loading = true;
            let { account, password } = this.innerDetail;
            let req = { account, rand: helpers.randStr() };
            let token = LoginUser.createToken(account, password, req);
            localStorage.setItem(dev.cacheKey.testUser, token);
            let rs = await testApi.userSignIn(req);
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

    $refs: { formVaild: IForm };

    private loading = false;

    private async handleSignUp() {
        await this.operateHandler('注册', async () => {
            this.loading = true;
            let rs = await testApi.userSignUp(this.innerDetail);
            this.innerDetail = this.getDetailData();
            this.$emit('success');
            this.$router.push(dev.routeConfig.userSignIn.path);
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
export default class UserInfo extends Base {
    loading = false;
    detail: UserDetailDataType = {};
    mounted() {
        this.$refs.loadView.loadData();
    }

    async getUserDetail() {
        let query = this.$route.query;
        let detail: UserDetailDataType;
        if (!query._id) {
            detail = await testApi.userDetail();
            detail.self = true;
        } else {
            detail = await testApi.userDetailQuery(query._id);
        }
        this.detail = detail;
        return detail;
    }

    $refs: { formVaild: IForm, loadView: ILoadView };
    pwdLoading = false;
    changePwdDetail = {
        nickname: '',
        pwd: '',
        newPwd: '',
        newPwdRepeat: '',
    };
    changePwdShow = false;
    async toggleUpdate(show: boolean) {
        this.changePwdShow = show;
        this.changePwdDetail.nickname = this.detail.nickname;
        this.changePwdDetail.pwd = '';
        this.changePwdDetail.newPwd = '';
        this.changePwdDetail.newPwdRepeat = '';
    }
    private rules = {
        pwd: [{
            validator: (rule, value, callback) => {
                if (this.changePwdDetail.newPwd && !value) {
                    callback(new Error('请输入密码'));
                } else {
                    callback();
                }
            },
            trigger: 'blur'
        }],
        newPwd: [{
            validator: (rule, value, callback) => {
                if (value && value === this.changePwdDetail.pwd) {
                    callback(new Error('新旧密码相同'));
                } else {
                    callback();
                }
            },
            trigger: 'blur'
        }],
        newPwdRepeat: [{
            validator: (rule, value, callback) => {
                if (this.changePwdDetail.newPwd && value !== this.changePwdDetail.newPwd) {
                    callback(new Error('两次输入密码不一致'));
                } else {
                    callback();
                }
            },
            trigger: 'blur'
        }],
    };

    handleUpdate() {
        this.operateHandler('修改', async () => {
            let user = this.storeUser.user;
            let req: any = {};
            let logOut = false;
            if (this.changePwdDetail.nickname && this.changePwdDetail.nickname != this.detail.nickname)
                req.nickname = this.changePwdDetail.nickname;
            if (this.changePwdDetail.newPwd) {
                logOut = true;
                req = {
                    ...req,
                    newPassword: this.changePwdDetail.newPwd,
                    round: helpers.randStr(),
                };
                let token = LoginUser.createToken(user.account, this.changePwdDetail.pwd, req);
                req = {
                    ...req,
                    token
                };
            }
            if (Object.keys(req).length)
                await testApi.userUpdate(req);
            if (logOut)
                this.storeUser.setUser(null);
            else {
                if (req.nickname)
                    this.detail.nickname = req.nickname;
            }
            this.toggleUpdate(false);
        }, {
                validate: this.$refs.formVaild.validate
            }
        );
    }

    private handlePress(e) {
        if (this.isPressEnter(e)) {
            this.handleUpdate();
        }
    }

    renderInfo(detail: UserDetailDataType) {
        return (
            <Card>
                <UserAvatarView user={detail} noTips showAccount style={{ marginLeft: '18px' }} />
                {detail.self && <a on-click={() => {
                    this.toggleUpdate(true);
                }} style={{ marginLeft: '5px' }}>修改</a>}
                {detail.self ?
                    <Form label-width={60}>
                        <FormItem label="状态">
                            {detail.statusText}
                        </FormItem>
                        <FormItem label="角色">
                            {MyTagModel.renderRoleTag(detail.roleList, true)}
                        </FormItem>
                        <FormItem label="权限">
                            {MyTagModel.renderAuthorityTag(detail.authorityList, true)}
                        </FormItem>
                        <FormItem label="可用权限">
                            {MyTagModel.renderAuthorityTag(Object.values(detail.auth), true)}
                        </FormItem>
                        <FormItem label="注册时间">
                            {detail.createdAt && moment(detail.createdAt).format(dev.dateFormat)}
                        </FormItem>
                    </Form> :
                    <Form label-width={60}>
                        <FormItem label="注册时间">
                            {detail.createdAt && moment(detail.createdAt).format(dev.dateFormat)}
                        </FormItem>
                    </Form>
                }
            </Card>
        );
    }

    render() {
        return (
            <div>
                <LoadView
                    ref="loadView"
                    loadFn={this.getUserDetail}
                    renderFn={(detail: UserDetailDataType) => {
                        return this.renderInfo(detail);
                    }} />

                <Modal v-model={this.changePwdShow} footer-hide>
                    <div class="dialog-view" on-keypress={this.handlePress}>
                        <h3>修改</h3>
                        <br />
                        <Form label-width={100} ref="formVaild" props={{ model: this.changePwdDetail }} rules={this.rules}>
                            <FormItem label="昵称" prop="nickname">
                                <Input v-model={this.changePwdDetail.nickname} />
                            </FormItem>
                            <FormItem label="密码" prop="pwd">
                                <Input v-model={this.changePwdDetail.pwd} type="password" placeholder="不修改密码时不用填" />
                            </FormItem>
                            <FormItem label="新密码" prop="newPwd">
                                <Input v-model={this.changePwdDetail.newPwd} type="password" />
                            </FormItem>
                            <FormItem label="确认密码" prop="newPwdRepeat">
                                <Input v-model={this.changePwdDetail.newPwdRepeat} type="password" />
                            </FormItem>
                            <FormItem>
                                <Button type="primary" long on-click={this.handleUpdate} loading={this.pwdLoading}>修改</Button>
                            </FormItem>
                        </Form>
                    </div>
                </Modal>
            </div >
        );
    }
}
