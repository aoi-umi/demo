import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import * as iview from 'iview';
import moment from 'dayjs';

import * as helpers from '@/helpers';
import { dev, myEnum } from '@/config';
import { testApi, testSocket } from '@/api';
import { convClass } from '@/components/utils';
import { Modal, Input, Form, FormItem, Button, Card, TabPane, Tabs, Time } from '@/components/iview';
import { MyUpload, IMyUpload } from '@/components/my-upload';
import { MyList, IMyList, ResultType } from '@/components/my-list';
import { MyLoad, IMyLoad } from '@/components/my-load';
import { Utils } from '@/components/utils';
import { LoginUser } from '@/model/user';

import { UserAvatarView } from './comps/user-avatar';
import { FollowButtonView } from './comps/follow-button';
import { AuthorityTagView } from './comps/authority-tag';

import { Base } from './base';
import { DetailDataType as UserDetailDataType } from './user-mgt';
import { ArticleListItemView } from './article';
import { RoleTagView } from './comps/role-tag';


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
@Component
export default class UserInfo extends Base {
    detail: UserDetailDataType = {};
    tab = '';
    mounted() {
        this.load();
    }

    @Watch('$route')
    route(to, from) {
        this.load();
    }

    async load() {
        // for (let key in this.tabLoaded) {
        //     this.tabLoaded[key] = false;
        // }
        let query = this.$route.query as { [key: string]: string };
        let loadRs = this.$refs.loadView.result;
        if (!loadRs.success)
            await this.$refs.loadView.loadData();
        if (loadRs.success) {
            if (myEnum.userTab.getAllValue().includes(query.tab)) {
                this.tab = query.tab;
            }
            this.changeTab();
        }
    }

    private changeTab() {
        if (this.tab === myEnum.userTab.粉丝 && !this.tabLoaded.follower) {
            this.handleFollowSearch(myEnum.followQueryType.粉丝);
        } else if (this.tab === myEnum.userTab.关注 && !this.tabLoaded.following) {
            this.handleFollowSearch(myEnum.followQueryType.关注);
        } else if (this.tab === myEnum.userTab.文章 && !this.tabLoaded.article) {
            this.handleArticleSearch();
        } else if (this.tab === myEnum.userTab.私信 && !this.tabLoaded.chat) {
            this.handleChatSearch();
        }
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
        formVaild: iview.Form, loadView: IMyLoad, upload: IMyUpload,
        followerList: IMyList<any>, followingList: IMyList<any>,
        articleList: IMyList<any>, chatList: IMyList<any>,
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
        chat: false,
    };
    private async followQuery(type, opt?) {
        opt = {
            ...opt,
            userId: this.detail._id,
            type,
        };

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

    private handleChatSearch() {
        this.$refs.chatList.handleQuery({ resetPage: true });
        this.tabLoaded.chat = true;
    }

    private async followQueryFn(data) {
        let rs = await testApi.followQuery(data);
        return rs;
    }

    private async chatListFn(data) {
        let rs = await testApi.chatList(data);
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
                        <UserAvatarView user={user} />
                        <span style={{ marginLeft: '5px' }}>{user.profile || dev.defaultProfile}</span>
                        <div class="flex-stretch">
                        </div>
                        <FollowButtonView user={user} />
                    </div>
                </Card>
            )
        });
    }

    private toChat(userId) {
        this.$router.push({
            path: dev.routeConfig.userChat.path,
            query: { _id: userId }
        });
    }
    private renderChat(rs: ResultType) {
        if (!rs.success || !rs.data.length) {
            let msg = !rs.success ? rs.msg : '空空的';
            return (
                <Card class="center" style={{ marginTop: '5px' }}>{msg}</Card>
            );
        }
        return rs.data.map(ele => {
            let user = ele.user;
            return (
                <Card style={{ marginTop: '5px' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'baseline' }}>
                        <UserAvatarView user={user} />
                        <div class="flex-stretch pointer" on-click={() => {
                            this.toChat(user._id);
                        }}>
                        </div>
                        <Time class="not-important" time={ele.createdAt} />
                    </div>
                    <div class="pointer" style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'baseline' }} on-click={() => {
                        this.toChat(user._id);
                    }}>
                        <span style={{
                            marginLeft: '42px', textOverflow: 'ellipsis',
                        }}>{ele.content}</span>
                        <div class="flex-stretch" >
                        </div>
                    </div>
                </Card>
            )
        });
    }

    renderInfo() {
        let detail = this.detail;
        return (
            <div style={{
                // background: 'rgba(255,255,255,0.6)'
            }}>
                <div style={{ display: 'flex', alignItems: 'baseline' }}>
                    <UserAvatarView user={detail} size="large" noTips showAccount style={{ marginLeft: '10px' }} />
                    {detail.self && <a on-click={() => {
                        this.toggleUpdate(true);
                    }} style={{ marginLeft: '5px' }}>修改</a>}
                    <div style={{ flexGrow: 1 }}></div>
                    {!detail.self && <FollowButtonView style={{ alignItems: 'flex-end' }} user={detail} />}
                </div>
                <Tabs v-model={this.tab} style={{ minHeight: '300px' }} on-on-click={(name: string) => {
                    // this.changeTab();
                    this.$router.push({
                        path: this.$route.path,
                        query: {
                            ...this.$route.query,
                            tab: name
                        }
                    });
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
                                    <RoleTagView value={detail.roleList} hideCode />
                                </FormItem>
                                <FormItem label="权限">
                                    <AuthorityTagView value={detail.authorityList} hideCode />
                                </FormItem>
                                <FormItem label="可用权限">
                                    <AuthorityTagView value={Object.values(detail.auth)} hideCode />
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
                    <TabPane name={myEnum.userTab.文章} label={() => {
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
                                if (!rs.success || !rs.data.length) {
                                    let msg = !rs.success ? rs.msg : '暂无数据';
                                    return (
                                        <Card style={{ marginTop: '5px', textAlign: 'center' }}>{msg}</Card>
                                    );
                                }
                                return rs.data.map(ele => {
                                    return (
                                        <ArticleListItemView value={ele} />
                                    );
                                });
                            }}
                        />
                    </TabPane>
                    <TabPane name={myEnum.userTab.粉丝} label={() => {
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
                    <TabPane name={myEnum.userTab.关注} label={() => {
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
                    <TabPane name={myEnum.userTab.私信} label={() => {
                        return <div>私信</div>
                    }}>
                        <MyList
                            ref="chatList"
                            type="custom"
                            hideSearchBox
                            on-query={(t) => {
                                this.$refs.chatList.query();
                            }}

                            queryFn={this.chatListFn}

                            customRenderFn={(rs) => {
                                return this.renderChat(rs);
                            }}
                        />
                    </TabPane>
                </Tabs>
            </div>
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
