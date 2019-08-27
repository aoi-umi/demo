import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import { Form as IForm } from 'iview';
import moment from 'moment';

import { convClass, convert } from '@/helpers';
import * as helpers from '@/helpers';
import { dev, myEnum } from '@/config';
import { testApi } from '@/api';
import { Modal, Input, Form, FormItem, Button, Card, TabPane, Tabs } from '@/components/iview';
import { MyTagModel } from '@/components/my-tag';
import { MyUpload, IMyUpload } from '@/components/my-upload';
import { MyList, IMyList, ResultType } from '@/components/my-list';
import { MyLoad, IMyLoad } from '@/components/my-load';
import { LoginUser } from '@/model/user';
import { DetailDataType as UserDetailDataType } from './user-mgt';
import { Base } from './base';
import { UserAvatarView } from './comps/user-avatar';
import { FollowButtonView } from './comps/follow-button';
import { ArticleListItemView } from './article';


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
                <Form class="dialog-content" label-width={50} ref="formVaild" props={{ model: detail }} rules={this.rules}>
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
                <Form class="dialog-content" label-width={100} ref="formVaild" props={{ model: detail }} rules={this.rules}>
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
    tab = '';
    mounted() {
        this.load();
    }

    @Watch('$route')
    route(to, from) {
        this.load();
    }

    load() {
        for (let key in this.tabLoaded) {
            this.tabLoaded[key] = false;
        }
        let query = this.$route.query as { [key: string]: string };
        this.$refs.loadView.loadData().then(() => {
            if (this.$refs.loadView.result.success) {
                if (['follower', 'following', 'article'].includes(query.tab)) {
                    this.tab = query.tab;
                }
                if (['follower', 'following'].includes(this.tab))
                    this.handleFollowSearch(this.tab === 'follower' ? myEnum.followQueryType.粉丝 : myEnum.followQueryType.关注);
                else if (this.tab == 'article')
                    this.handleArticleSearch();
            }
        });
    }

    async getUserDetail() {
        let query = this.$route.query;
        let detail: UserDetailDataType;
        let self = !query._id || query._id == this.storeUser.user._id;
        if (self) {
            detail = await testApi.userDetail();
        } else {
            detail = await testApi.userDetailQuery(query._id);
        }
        detail.self = self;
        this.detail = detail;
        return detail;
    }

    $refs: {
        formVaild: IForm, loadView: IMyLoad, upload: IMyUpload,
        followerList: IMyList<any>, followingList: IMyList<any>,
        articleList: IMyList<any>,
    };
    updateLoading = false;
    private getUpdateUser() {
        return {
            avatar: '',
            avatarUrl: '',
            nickname: '',
            pwd: '',
            newPwd: '',
            newPwdRepeat: '',
            profile: ''
        };
    }
    updateDetail = this.getUpdateUser();
    updateShow = false;
    avatarList = [];
    async toggleUpdate(show: boolean) {
        this.updateShow = show;
        if (show) {
            this.updateDetail = {
                ...this.getUpdateUser(),
                avatar: this.detail.avatar,
                avatarUrl: this.detail.avatarUrl,
                nickname: this.detail.nickname,
                profile: this.detail.profile,
            };
            this.avatarList = this.updateDetail.avatarUrl ? [{ url: this.updateDetail.avatarUrl }] : [];
            this.setRules();
        }
    }
    private rules = {};
    private setRules() {
        this.rules = {
            pwd: [{
                validator: (rule, value, callback) => {
                    if (this.updateDetail.newPwd && !value) {
                        callback(new Error('请输入密码'));
                    } else {
                        callback();
                    }
                },
                trigger: 'blur'
            }],
            newPwd: [{
                validator: (rule, value, callback) => {
                    if (value && value === this.updateDetail.pwd) {
                        callback(new Error('新旧密码相同'));
                    } else {
                        callback();
                    }
                },
                trigger: 'blur'
            }],
            newPwdRepeat: [{
                validator: (rule, value, callback) => {
                    if (this.updateDetail.newPwd && value !== this.updateDetail.newPwd) {
                        callback(new Error('两次输入密码不一致'));
                    } else {
                        callback();
                    }
                },
                trigger: 'blur'
            }],
        };
    }

    handleUpdate() {
        this.operateHandler('修改', async () => {
            this.updateLoading = true;
            let upload = this.$refs.upload;
            let err = await upload.upload();
            if (err.length) {
                throw new Error(`上传头像失败:${err[0]}`);
            }
            let file = upload.fileList[0];
            if (file && file.uploadRes)
                this.updateDetail.avatar = file.uploadRes;

            let user = this.storeUser.user;
            let req: any = {};
            let logOut = false;
            function isUpdate(newVal, oldVal) {
                return newVal && newVal != oldVal
            }
            let detail = this.detail;
            let updateKey = ['nickname', 'profile', 'avatar'];
            updateKey.forEach(key => {
                if (isUpdate(this.updateDetail[key], detail[key]))
                    req[key] = this.updateDetail[key];
            });
            if (this.updateDetail.newPwd) {
                logOut = true;
                req = {
                    ...req,
                    newPassword: this.updateDetail.newPwd,
                    round: helpers.randStr(),
                };
                let token = LoginUser.createToken(user.account, this.updateDetail.pwd, req);
                req = {
                    ...req,
                    token
                };
            }
            if (Object.keys(req).length) {
                let rs = await testApi.userUpdate(req);
                if (logOut)
                    this.storeUser.setUser(null);
                else {
                    this.storeUser.setUser({
                        ...this.storeUser.user,
                        ...rs,
                    });
                    this.detail = {
                        ...this.detail,
                        ...rs,
                    };
                }
            }
            this.toggleUpdate(false);
        }, {
                validate: this.$refs.formVaild.validate
            }
        ).finally(() => {
            this.updateLoading = false;
        });
    }

    private handlePress(e) {
        if (this.isPressEnter(e)) {
            this.handleUpdate();
        }
    }

    private followerAnyKey = '';
    private followingAnyKey = '';
    private articleAnyKey = '';
    private tabLoaded = {
        following: false,
        follower: false,
        article: false,
    };
    private async followQuery(type, opt?) {
        opt = {
            ...opt,
            userId: this.detail._id,
            type,
        };

        // this.$router.push({
        //     path: this.$route.path,
        //     query: {
        //         ...this.$route.query,
        //         tab: name
        //     }
        // });

        if (type == myEnum.followQueryType.粉丝)
            await this.$refs.followerList.query(opt);
        else
            await this.$refs.followingList.query(opt);
    }

    private handleFollowSearch(type) {
        if (type == myEnum.followQueryType.粉丝) {
            this.$refs.followerList.handleQuery({ resetPage: true });
            this.tabLoaded.follower = true;
        } else {
            this.$refs.followingList.handleQuery({ resetPage: true });
            this.tabLoaded.following = true;
        }
    }

    private handleArticleSearch() {
        this.$refs.articleList.handleQuery({ resetPage: true });
        this.tabLoaded.article = true;
    }

    private async followQueryFn(data) {
        let rs = await testApi.followQuery(data);
        return rs;
    }

    private renderFollow(type: number, rs: ResultType) {
        if (!rs.success || !rs.data.length) {
            let msg = !rs.success ? rs.msg : '空空的';
            return (
                <Card class="center" style={{ marginTop: '5px' }}>{msg}</Card>
            );
        }
        return rs.data.map(ele => {
            let user = type == myEnum.followQueryType.粉丝 ? ele.followerUser : ele.followingUser;
            return (
                <Card style={{ marginTop: '5px' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'baseline' }}>
                        <UserAvatarView tipsPlacement="right-start" user={user} />
                        <span style={{ marginLeft: '5px' }}>{user.profile || dev.defaultProfile}</span>
                        <div style={{
                            flexGrow: 1
                        }} >
                        </div>
                        <FollowButtonView user={user} />
                    </div>
                </Card>
            )
        });
    }

    renderInfo() {
        let detail = this.detail;
        return (
            <Card style={{
                // background: 'rgba(255,255,255,0.6)'
            }}>
                <div style={{ display: 'flex', alignItems: 'baseline' }}>
                    <UserAvatarView user={detail} size="large" noTips showAccount style={{ marginLeft: '10px' }} />
                    {detail.self && <a on-click={() => {
                        this.toggleUpdate(true);
                    }} style={{ marginLeft: '5px' }}>修改</a>}
                    <div style="flex-grow: 1;"></div>
                    {!detail.self && <FollowButtonView style={{ alignItems: 'flex-end' }} user={detail} />}
                </div>
                <Tabs v-model={this.tab} style={{ minHeight: '300px' }} on-on-click={(name: string) => {
                    if (name === 'follower' && !this.tabLoaded.follower) {
                        this.handleFollowSearch(myEnum.followQueryType.粉丝);
                    } else if (name === 'following' && !this.tabLoaded.following) {
                        this.handleFollowSearch(myEnum.followQueryType.关注);
                    } else if (name === 'article') {
                        this.handleArticleSearch();
                    }
                }}>
                    <TabPane label="概览">
                        {detail.self ?
                            <Form class="form-no-error" label-width={60}>
                                <FormItem label="状态">
                                    {detail.statusText}
                                </FormItem>
                                <FormItem label="简介">
                                    {detail.profile || dev.defaultProfile}
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
                            <Form class="form-no-error" label-width={60}>
                                <FormItem label="简介">
                                    {detail.profile || dev.defaultProfile}
                                </FormItem>
                                <FormItem label="注册时间">
                                    {detail.createdAt && moment(detail.createdAt).format(dev.dateFormat)}
                                </FormItem>
                            </Form>
                        }
                    </TabPane>
                    <TabPane name="article" label={() => {
                        return <div>文章: {detail.article}</div>
                    }}>
                        <Input v-model={this.articleAnyKey} search on-on-search={this.handleArticleSearch} />
                        <MyList
                            ref="articleList"
                            type="custom"
                            hideSearchBox
                            on-query={(t) => {
                                this.$refs.articleList.query({ userId: detail._id, anyKey: this.articleAnyKey });
                            }}

                            queryFn={(data) => {
                                return testApi.articleQuery(data);
                            }}

                            customRenderFn={(rs) => {
                                return <ArticleListItemView rs={rs} />;
                            }}
                        />
                    </TabPane><TabPane name="follower" label={() => {
                        return <div>粉丝: {detail.follower}</div>
                    }}>
                        <Input v-model={this.followerAnyKey} search on-on-search={() => {
                            this.handleFollowSearch(myEnum.followQueryType.粉丝);
                        }} />
                        <MyList
                            ref="followerList"
                            type="custom"
                            hideSearchBox
                            on-query={(t) => {
                                this.followQuery(myEnum.followQueryType.粉丝, { anyKey: this.followerAnyKey });
                            }}

                            queryFn={this.followQueryFn}

                            customRenderFn={(rs) => {
                                return this.renderFollow(myEnum.followQueryType.粉丝, rs);
                            }}
                        />
                    </TabPane>
                    <TabPane name="following" label={() => {
                        return <div>关注: {detail.following}</div>
                    }}>
                        <Input v-model={this.followingAnyKey} search on-on-search={() => {
                            this.handleFollowSearch(myEnum.followQueryType.关注);
                        }} />
                        <MyList
                            ref="followingList"
                            type="custom"
                            hideSearchBox
                            on-query={(t) => {
                                this.followQuery(myEnum.followQueryType.关注, { anyKey: this.followingAnyKey });
                            }}

                            queryFn={this.followQueryFn}

                            customRenderFn={(rs) => {
                                return this.renderFollow(myEnum.followQueryType.关注, rs);
                            }}
                        />
                    </TabPane>
                </Tabs>
            </Card>
        );
    }

    render() {
        return (
            <div>
                <MyLoad
                    ref="loadView"
                    loadFn={this.getUserDetail}
                    renderFn={() => {
                        return this.renderInfo();
                    }} />

                <Modal v-model={this.updateShow} footer-hide>
                    <div class="dialog-view" on-keypress={this.handlePress}>
                        <h3>修改</h3>
                        <br />
                        <Form class="dialog-content" ref="formVaild" props={{ model: this.updateDetail }} rules={this.rules}>
                            <FormItem prop="avatar">
                                <MyUpload
                                    class="center"
                                    ref='upload'
                                    headers={testApi.defaultHeaders}
                                    uploadUrl={testApi.imgUploadUrl}
                                    successHandler={(res, file) => {
                                        let rs = testApi.imgUplodaHandler(res);
                                        file.url = rs.url;
                                        return rs.fileId;
                                    }}
                                    format={['jpg', 'png', 'bmp', 'gif']}
                                    width={120} height={120}
                                    cropperOptions={{
                                        autoCropWidth: 288,
                                        autoCropHeight: 288,
                                        fixedNumber: [1, 1],
                                    }}
                                    v-model={this.avatarList}
                                    shape="circle"
                                />
                            </FormItem>
                            <FormItem prop="nickname">
                                <span>昵称</span>
                                <Input v-model={this.updateDetail.nickname} />
                            </FormItem>
                            <FormItem prop="pwd">
                                <span>密码</span>
                                <Input v-model={this.updateDetail.pwd} type="password" placeholder="不修改密码时不用填" />
                            </FormItem>
                            <FormItem prop="newPwd">
                                <span>新密码</span>
                                <Input v-model={this.updateDetail.newPwd} type="password" />
                            </FormItem>
                            <FormItem prop="newPwdRepeat">
                                <span>确认密码</span>
                                <Input v-model={this.updateDetail.newPwdRepeat} type="password" />
                            </FormItem>
                            <FormItem prop="profile">
                                <span>简介</span>
                                <Input v-model={this.updateDetail.profile} placeholder={dev.defaultProfile} type="textarea" />
                            </FormItem>
                            <FormItem>
                                <Button type="primary" long on-click={this.handleUpdate} loading={this.updateLoading}>修改</Button>
                            </FormItem>
                        </Form>
                    </div>
                </Modal>
            </div >
        );
    }
}
